import { getInjectableName } from '../../di/provider';
import { isString, isType, getFuncName, global, noop, isArray, isJsObject, isFunction } from '../../../facade/lang';
import { reflector } from '../../reflection/reflection';
import { DirectiveMetadata } from '../metadata_directives';
import { ListWrapper, StringMapWrapper } from '../../../facade/collections';
import { ChildrenChangeHook } from '../../linker/directive_lifecycle_interfaces';
import { QueryMetadata } from '../metadata_di';
import { DirectiveCtrl, NgmDirective } from '../directive_provider';
import { StringWrapper } from '../../../facade/primitives';

const REQUIRE_PREFIX_REGEXP = /^(?:(\^\^?)?(\?)?(\^\^?)?)?/;

/**
 * resolving DOM instances by provided @ContentChild(ren)/@ViewChild(ren)
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

  if ( isString( selector ) ) {
    return selector;
  }
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
            return ctrl instanceof propMetaInstance.selector;

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

export function directiveControllerFactory<T extends DirectiveCtrl,U extends Type>(
  caller: T,
  controller: U,
  $injector: ng.auto.IInjectorService,
  locals: any,
  requireMap: StringMap,
  _ddo: NgmDirective
): T&U {

  // Create an instance of the controller without calling its constructor
  const instance = Object.create(controller.prototype);

  const { $element } : { $element: ng.IAugmentedJQuery } = locals;

  if ( StringMapWrapper.size( requireMap ) ) {

    // change injectables to proper inject directives
    // we wanna do this only if we inject som locals/directives
    controller.$inject = createNewInjectablesToMatchLocalDi( controller.$inject, requireMap );

  }


  const $requires = getEmptyRequiredControllers( requireMap );

  // Remember, angular has already set those bindings on the `caller`
  // argument. Now we need to extend them onto our `instance`. It is important
  // to extend after defining the properties. That way we fire the setters.
  StringMapWrapper.assign( instance, caller );

  // Finally, invoke the constructor using the injection array and the captured locals
  $injector.invoke( controller, instance, StringMapWrapper.assign( locals, $requires ) );

  _ddo._ngOnInitBound = function _ngOnInitBound(){

    // invoke again only if there are any directive requires
    // #perf
    if ( StringMapWrapper.size( requireMap ) ) {
      const $requires = getRequiredControllers( requireMap, $element, controller );
      $injector.invoke( controller, instance, StringMapWrapper.assign( locals, $requires ) );
    }

    if ( isFunction( instance.ngOnInit ) ) {
      instance.ngOnInit()
    }

  };

  /*if ( isFunction( instance.ngOnDestroy ) ) {
    $scope.$on( '$destroy', instance.ngOnDestroy.bind( instance ) );
  }*/

  /*if (typeof instance.ngAfterViewInit === 'function') {
    ddo.ngAfterViewInitBound = instance.ngAfterViewInit.bind(instance);
  }*/

  // Return the controller instance
  return instance;

}

function injectionArgs(fn, locals, serviceName, injects) {
  var args = [],
    // $inject = createInjector.$$annotate(fn, strictDi, serviceName);
    $inject = injects;

  for (var i = 0, length = $inject.length; i < length; i++) {
    var key = $inject[i];
    if (typeof key !== 'string') {
      throw new Error(`itkn, Incorrect injection token! Expected service name as string, got ${key}`);
    }
/*    args.push( locals && locals.hasOwnProperty( key )
      ? locals[ key ]
      : getService( key, serviceName ) );*/
    args.push( locals[ key ] );
  }
  return args;
}

export function getControllerOnElement( $element: ng.IAugmentedJQuery, ctrlName: string ) {

  if ( !$element ) {

    return null;

  }

  return $element.controller(ctrlName);

}

/**
 * Angular 1 copy of how to require other directives
 * @param require
 * @param $element
 * @param directive
 * @returns {any|null}
 */
export function getRequiredControllers(
  require: string|string[]|{[key:string]:any},
  $element: ng.IAugmentedJQuery,
  directive: Type
): Object|Object[]|{[ctrlName:string]:Object} {

  var value;

  if (isString(require)) {
    var match = require.match(REQUIRE_PREFIX_REGEXP);
    var name = require.substring(match[0].length);
    var inheritType = match[1] || match[3];
    var optional = match[2] === '?';

    //If only parents then start at the parent element
    if ( inheritType === '^^' ) {
      $element = $element.parent() as ng.IAugmentedJQuery;
    }

    if (!value) {
      var dataName = `$${ name }Controller`;
      value = inheritType ? $element.inheritedData(dataName) : $element.data(dataName);
    }

    if (!value && !optional) {
      throw new Error(
        `Directive/Controller '${name}', required by directive '${getFuncName(directive)}', can't be found!`);
    }
  } else if ( isArray( require ) ) {
    value = [];
    for ( var i = 0, ii = (require as string[]).length; i < ii; i++ ) {
      value[ i ] = getRequiredControllers( require[ i ], $element, directive );
    }
  } else if ( isJsObject( require ) ) {
    value = {};
    StringMapWrapper.forEach( require, function ( controller, property ) {
      value[ property ] = getRequiredControllers( controller, $element, directive );
    } );
  }

  return value || null;
}


export function getEmptyRequiredControllers( requireMap: {[key:string]:string} ): {[key:string]:void} {

  return StringMapWrapper.keys( requireMap ).reduce( ( acc, keyName: string )=>{
    acc[ keyName ] = undefined;
    return acc;
  }, {} );

}

export function createNewInjectablesToMatchLocalDi(
  originalInjectables: string[],
  requireMap: {[key:string]:string}
): string[] {

  const requireKeys = StringMapWrapper.keys( requireMap );

  return originalInjectables.slice()
    .map( injectable => {
      const [replaceInjName] = requireKeys
        .filter( keyName => StringWrapper.startsWith( keyName, injectable ) );

      // if found remove that key so we won't assign the same
      if(replaceInjName){
        const idx = requireKeys.indexOf(replaceInjName);
        requireKeys.splice(idx,1);
      }

      return replaceInjName || injectable;

    } );

}
