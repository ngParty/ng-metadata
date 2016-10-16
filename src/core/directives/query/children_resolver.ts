import { global, isString, noop, isType, isJsObject, getFuncName, isFunction } from '../../../facade/lang';
import { ListWrapper, StringMapWrapper } from '../../../facade/collections';
import { ChildrenChangeHook } from '../../linker/directive_lifecycle_interfaces';
import { reflector } from '../../reflection/reflection';
import { getInjectableName } from '../../di/provider';
import { DirectiveMetadata } from '../metadata_directives';
import {
  QueryMetadata,
  ViewQueryMetadata,
  ViewChildMetadata,
  ViewChildrenMetadata,
  ContentChildMetadata,
  ContentChildrenMetadata
} from '../metadata_di';
import { DirectiveCtrl } from '../constants';


/**
 * setup watchers for children component/directives provided by @Query decorators
 * - setup @ContentChild/@ContentChildren/@ViewChild/@ViewChildren
 * @param scope
 * @param element
 * @param ctrl
 * @param queries
 * @private
 */
export function _setupQuery(
  scope: ng.IScope,
  element: ng.IAugmentedJQuery,
  ctrl: DirectiveCtrl,
  queries: {[key:string]:QueryMetadata|ViewQueryMetadata}
) {

  const SEMAPHORE_PROP_NAMES = Object.freeze({
    view: '__readViewChildrenOrderScheduled',
    content: '__readContentChildrenOrderScheduled'
  });
  const DOM_RESOLVER_TYPES = Object.freeze( {
    view: 'view',
    content: 'content'
  } );

  if ( StringMapWrapper.size( queries ) === 0 ) {
    return;
  }

  const onChildrenChangedCb = _getOnChildrenResolvers( element, ctrl, queries );

  ctrl.__readContentChildrenOrderScheduled = false;
  ctrl.__readViewChildrenOrderScheduled = false;
  // this is our created _ngOnChildrenChanged which will be called by children directives
  const _ngOnChildrenChanged = function (
    type: ChildrenChangeHook,
    onFirstChangeDoneCb: Function[] = [],
    domResolverCb = onChildrenChangedCb
  ) {

    let orderScheduledSemaphorePropName = '';
    let domResolverCbType = '';

    if ( type === ChildrenChangeHook.FromView ) {
      orderScheduledSemaphorePropName = SEMAPHORE_PROP_NAMES.view;
      domResolverCbType = DOM_RESOLVER_TYPES.view;
    } else if ( type === ChildrenChangeHook.FromContent ) {
      domResolverCbType = DOM_RESOLVER_TYPES.content;
      orderScheduledSemaphorePropName = SEMAPHORE_PROP_NAMES.content;
    } else {
      throw new Error( `_ngOnChildrenChanged: queryType(${type}) must be one of FromView|FromContent` );
    }

    if ( ctrl[ orderScheduledSemaphorePropName ] ) {
      return;
    }

    ctrl[ orderScheduledSemaphorePropName ] = true;
    // we execute callback within $evalAsync to extend $digest loop count, which will not trigger another
    // $rootScope.$digest === #perfmatters
    scope.$evalAsync( () => {

      // turn semaphore On back again
      ctrl[ orderScheduledSemaphorePropName ] = false;

      // query DOM and assign instances/jqLite to controller properties
      domResolverCb[ domResolverCbType ].forEach( cb=>cb() );

      // when DOM is queried we can execute DirectiveComponent life cycles which have been registered
      // AfterViewInit | AfterContentInit
      onFirstChangeDoneCb.forEach( ( cb )=> { isFunction( cb ) && cb() } );
    } );

  };

  // this method needs to be called from children which are we querying
  // if they are rendered dynamically/async
  ctrl._ngOnChildrenChanged = _ngOnChildrenChanged.bind(ctrl);


  /**
   * get all callbacks which will be executed withing $scope.$evalAsync,
   * which are querying for DOM elements and gets controller instances from host element children
   * @param element
   * @param ctrl
   * @param queries
   * @returns {view: Function[], content: Function[]}
   * @private
   */
  function _getOnChildrenResolvers(
    element: ng.IAugmentedJQuery,
    ctrl: any,
    queries: {[key:string]:QueryMetadata|ViewQueryMetadata}
  ) {

    const _onChildrenChangedCbMap = {
      [DOM_RESOLVER_TYPES.view]: [],
      [DOM_RESOLVER_TYPES.content]: []
    };

    StringMapWrapper.forEach( queries, function ( meta: QueryMetadata|ViewQueryMetadata, key: string ) {

      if ( meta instanceof ViewChildMetadata ) {
        _onChildrenChangedCbMap[DOM_RESOLVER_TYPES.view].push( _resolveViewChild( element, ctrl, key, meta ) );
      }

      if ( meta instanceof ViewChildrenMetadata ) {
        _onChildrenChangedCbMap[DOM_RESOLVER_TYPES.view].push( _resolveViewChildren( element, ctrl, key, meta ) );
      }

      if ( meta instanceof ContentChildMetadata ) {
        _onChildrenChangedCbMap[DOM_RESOLVER_TYPES.content].push( _resolveContentChild( element, ctrl, key, meta ) );
      }

      if ( meta instanceof ContentChildrenMetadata ) {
        _onChildrenChangedCbMap[DOM_RESOLVER_TYPES.content].push( _resolveContentChildren( element, ctrl, key, meta ) );
      }

    } );

    return _onChildrenChangedCbMap;

    function _resolveViewChild( element: ng.IAugmentedJQuery, ctrl: any, key: string, meta: QueryMetadata|ViewQueryMetadata ) {
      return _resolveChildrenFactory( element, ctrl, key, meta.selector, DOM_RESOLVER_TYPES.view, true );
    }

    function _resolveContentChild( element: ng.IAugmentedJQuery, ctrl: any, key: string, meta: QueryMetadata|ViewQueryMetadata ) {
      return _resolveChildrenFactory( element, ctrl, key, meta.selector, DOM_RESOLVER_TYPES.content, true );
    }

    function _resolveViewChildren(element: ng.IAugmentedJQuery, ctrl: any, key: string, meta: QueryMetadata|ViewQueryMetadata) {
      return _resolveChildrenFactory( element, ctrl, key, meta.selector, DOM_RESOLVER_TYPES.view );
    }

    function _resolveContentChildren(element: ng.IAugmentedJQuery, ctrl: any, key: string, meta: QueryMetadata|ViewQueryMetadata) {
      return _resolveChildrenFactory( element, ctrl, key, meta.selector, DOM_RESOLVER_TYPES.content );
    }

  }

}
/**
 * resolving DOM instances by provided @ContentChild(ref)/@ViewChild(ref)
 * - if querying for string, we handle it as a selector and return jqLite instances
 * - if querying for Type( directive | component ) we get proper selector and controller from
 * provided Type reference, query the DOM and return that controller instance if exists, otherwise null
 * @param element
 * @param ctrl
 * @param key
 * @param cssSelector
 * @param type
 * @param firstOnly
 * @returns {function(): void}
 * @private
 */
export function _resolveChildrenFactory(
  element: ng.IAugmentedJQuery,
  ctrl: any,
  key: string,
  cssSelector: string|Type,
  type: string,
  firstOnly: boolean = false
) {

  const { selector, childCtrlName } = _getSelectorAndCtrlName( cssSelector );

  return _childResolver;

  function _childResolver(): void {

    if ( firstOnly ) {

      ctrl[ key ] = null;
      const child = _getChildElements( element, selector, type, firstOnly );
      const childInstance = isString( cssSelector )
        ? child
        : getControllerOnElement( child, childCtrlName );
      ctrl[ key ] = childInstance;

    } else {

      ctrl[ key ] = [];
      const children = _getChildElements( element, selector, type );
      if ( isString( cssSelector ) ) {
        ctrl[ key ] = children;
        return;
      }
      for ( let i = 0; i < children.length; i++ ) {

        ctrl[ key ].push(
          getControllerOnElement( (children.eq( i ) as ng.IAugmentedJQuery ), childCtrlName )
        );
      }

    }
  }

}

/**
 * query View/Content DOM for particular child elements/attributes selector
 * @param $element
 * @param selector
 * @param type
 * @param firstOnly
 * @returns {IAugmentedJQuery}
 * @private
 */
export function _getChildElements(
  $element: ng.IAugmentedJQuery,
  selector: string,
  type: string,
  firstOnly: boolean = false
): ng.IAugmentedJQuery {

  let querySelector = '';

  if ( type === 'view' ) {
    // Note: we are guarding only for first nested child inside ng-transclude
    // this would be to complicated and DOM heavy to select only selectors outside ng-transclude
    // - it should be author responsibility to not include Component view directive within <ng-transclude> and querying for them
    querySelector = `:not(ng-transclude):not([ng-transclude]) > ${ selector }`;
  }
  if ( type === 'content' ) {
    querySelector = `ng-transclude ${ selector }, [ng-transclude] ${ selector }`;
  }
  const queryMethod = firstOnly
    ? 'querySelector'
    : 'querySelectorAll';

  return global.angular.element( $element[ 0 ][ queryMethod ]( querySelector ) );
}


export function _getSelectorAndCtrlName( childSelector: string|Type ): {selector:string,childCtrlName:string} {

  const selector = _getSelector( childSelector );
  const childCtrlName = getInjectableName( childSelector );

  return { selector, childCtrlName };
}


/**
 * get CSS selector from Component/Directive decorated class metadata
 * @param selector
 * @returns {string}
 * @private
 */
export function _getSelector( selector: string|Type ): string {

  if ( isString( selector ) ) { return selector }

  if ( isType( selector ) ) {

    const [annotation] = reflector.annotations( selector );

    if ( annotation instanceof DirectiveMetadata ) {
      return annotation.selector;
    }

  }

  throw new Error( `cannot query for non Directive/Component type ${ getFuncName( selector as any )}` );
}

/**
 * creates functions which will be called from parent component which is querying this component
 * - component which queries needs to be injected to child,
 * here child creates special callbacks by type of @Query which will be called from postLink and on scope destroy so
 * we clean up GC
 * @param ctrl
 * @param requiredCtrls
 * @returns {Object|Array|T|function()[]}
 * @private
 */
export function _getParentCheckNotifiers( ctrl: DirectiveCtrl, requiredCtrls: Object[] ): Function[] {

  const parentCheckedNotifiers = requiredCtrls.reduce(
    ( acc, requiredCtrl: DirectiveCtrl )=> {

      if ( !isJsObject( requiredCtrl ) ) {
        return acc;
      }

      const Ctor = requiredCtrl.constructor;

      if ( !isType( Ctor ) ) {
        return acc;
      }

      const propMeta = reflector.propMetadata( Ctor );

      if ( !StringMapWrapper.size( propMeta ) ) {
        return acc;
      }

      const _parentCheckedNotifiers = [];
      StringMapWrapper.forEach( propMeta, ( propMetaPropArr: any[] )=> {

        propMetaPropArr
          .filter( ( propMetaInstance: any )=> {

            // check if propMeta is one of @Query types and that it queries for Directive/Component ( typeof selector == function )
            if ( !((propMetaInstance instanceof QueryMetadata ) && isType( (propMetaInstance as QueryMetadata).selector )) ) {
              return false;
            }
            // check if current child is really queried from its parent
            return ctrl instanceof (propMetaInstance.selector as Type);

          } )
          .forEach( ( propMetaInstance: QueryMetadata )=> {

            // parent queried for this child with one from @ContentChild/@ContentChildren
            if ( !propMetaInstance.isViewQuery ) {

              _parentCheckedNotifiers.push(
                ()=>requiredCtrl._ngOnChildrenChanged(
                  ChildrenChangeHook.FromContent,
                  [ requiredCtrl.ngAfterContentChecked.bind( requiredCtrl ) ]
                )
              );

            }
            // parent queried for this child with one from @ViewChild/@ViewChildren
            if ( propMetaInstance.isViewQuery ) {

              _parentCheckedNotifiers.push(
                ()=>requiredCtrl._ngOnChildrenChanged(
                  ChildrenChangeHook.FromView,
                  [ requiredCtrl.ngAfterViewChecked.bind( requiredCtrl ) ]
                )
              );

            }

          } );

      } );

      return [ ...acc, ..._parentCheckedNotifiers ];

    }, [] );

  return ListWrapper.size( parentCheckedNotifiers )
    ? parentCheckedNotifiers
    : [ noop ];

}

export function getControllerOnElement( $element: ng.IAugmentedJQuery, ctrlName: string ) {

  if ( !$element ) { return null }

  return $element.controller(ctrlName);
}
