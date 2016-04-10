import { getInjectableName } from '../../di/provider';
import {
  isString,
  isType,
  getFuncName,
  global,
  noop,
  isArray,
  isJsObject,
  isFunction,
  isBoolean
} from '../../../facade/lang';
import { reflector } from '../../reflection/reflection';
import { DirectiveMetadata, ComponentMetadata } from '../metadata_directives';
import { ListWrapper, StringMapWrapper } from '../../../facade/collections';
import { ChildrenChangeHook } from '../../linker/directive_lifecycle_interfaces';
import { QueryMetadata } from '../metadata_di';
import { DirectiveCtrl, NgmDirective } from '../directive_provider';
import { StringWrapper } from '../../../facade/primitives';
import { ChangeDetectionUtil, SimpleChange } from '../../change_detection/change_detection_util';
import { changesQueueService } from '../../change_detection/changes_queue';

const REQUIRE_PREFIX_REGEXP = /^(?:(\^\^?)?(\?)?(\^\^?)?)?/;

const BINDING_MODE = Object.freeze( {
  oneWay: '<',
  twoWay: '=',
  output: '&',
  attr: '@',
  optional: '?'
} );

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
  locals: {
    $scope: ng.IScope,
    $element: ng.IAugmentedJQuery,
    $attrs: ng.IAttributes,
    $transclude: ng.ITranscludeFunction
  },
  requireMap: StringMap,
  _ddo: NgmDirective,
  metadata: DirectiveMetadata | ComponentMetadata
): T & U {

  const _services = {
    $parse: $injector.get<ng.IParseService>( '$parse' ),
    $interpolate: $injector.get<ng.IInterpolateService>( '$interpolate' ),
    $rootScope: $injector.get<ng.IRootScopeService>( '$rootScope' )
  };
  const { $scope, $element, $attrs } = locals;

  // Create an instance of the controller without calling its constructor
  const instance = Object.create( controller.prototype );

  // NOTE: this is not needed because we are creating bindings manually because of
  // angular behaviour https://github.com/ngParty/ng-metadata/issues/53
  // ===================================================================
  // Remember, angular has already set those bindings on the `caller`
  // argument. Now we need to extend them onto our `instance`. It is important
  // to extend after defining the properties. That way we fire the setters.
  //
  // StringMapWrapper.assign( instance, caller );

  // setup @Input/@Output/@Attrs for @Component/@Directive
  const { removeWatches, initialChanges } = _createDirectiveBindings(
    !isAttrDirective( metadata ),
    $scope,
    $attrs,
    instance,
    metadata,
    _services
  );
  $scope.$on( '$destroy', ()=> removeWatches );

  // change injectables to proper inject directives
  // we wanna do this only if we inject some locals/directives
  if ( StringMapWrapper.size( requireMap ) ) {

    controller.$inject = createNewInjectablesToMatchLocalDi( controller.$inject, requireMap );

  }

  const $requires = getEmptyRequiredControllers( requireMap );

  // $injector.invoke will delete any @Input/@Attr/@Output which were resolved within _createDirectiveBindings
  // and which have set default values in constructor. We need to store them and reassign after this invoke
  const initialInstanceBindingValues = getInitialBindings( instance );

  // Finally, invoke the constructor using the injection array and the captured locals
  $injector.invoke( controller, instance, StringMapWrapper.assign( locals, $requires ) );

  // reassign back the initial binding values, just in case if we used default values
  StringMapWrapper.assign( instance, initialInstanceBindingValues );


  /*if ( isFunction( instance.ngOnDestroy ) ) {
    $scope.$on( '$destroy', instance.ngOnDestroy.bind( instance ) );
  }*/

  /*if (typeof instance.ngAfterViewInit === 'function') {
    ddo.ngAfterViewInitBound = instance.ngAfterViewInit.bind(instance);
  }*/

  if ( isFunction( instance.ngOnChanges ) ) {
    instance.ngOnChanges( initialChanges );
  }

  _ddo._ngOnInitBound = function _ngOnInitBound(){

    // invoke again only if there are any directive requires
    // #perf
    if ( StringMapWrapper.size( requireMap ) ) {
      const $requires = getRequiredControllers( requireMap, $element, controller );

      // $injector.invoke will delete any @Input/@Attr/@Output which were resolved within _createDirectiveBindings
      // and which have set default values in constructor. We need to store them and reassign after this invoke
      const initialInstanceBindingValues = getInitialBindings( instance );

      $injector.invoke( controller, instance, StringMapWrapper.assign( locals, $requires ) );

      // reassign back the initial binding values, just in case if we used default values
      StringMapWrapper.assign( instance, initialInstanceBindingValues );
    }

    if ( isFunction( instance.ngOnInit ) ) {
      instance.ngOnInit()
    }

  };

  // Return the controller instance
  return instance;

}

function getInitialBindings( instance ): {[propName: string]: any} {
  const initialBindingValues = {};
  StringMapWrapper.forEach( instance, ( value: any, propName: string ) => {

    if ( instance[ propName ] ) {
      initialBindingValues[ propName ] = value;
    }

  } );
  return initialBindingValues;
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


export function isAttrDirective( metadata ): boolean {
  return metadata instanceof DirectiveMetadata && !(metadata instanceof ComponentMetadata);
}


/**
 * returns angular 1 bindToController Map
 * ```js
 * { property: '=', onEvent: '&', attrVal: '@', oneWay: '<' }
 * ```
 * @returns {StringMap}
 * @internal
 * @deprecated
 * @private
 */
export function _extractBindings(
  {
    inputs=[],
    outputs=[],
    attrs=[]
  }: {
    inputs?: string[],
    outputs?: string[],
    attrs?: string[]
  }={}
): StringMap {

  const parsedBindings = _parseBindings( { inputs, outputs, attrs } );

  return StringMapWrapper
    .values( parsedBindings )
    .reduce( ( acc, bindingMap: ParsedBindingsMap ) => {

      StringMapWrapper.forEach( bindingMap, ( config: ParsedBindingValue, name: string ) => {
        const optionalSymbol = config.optional
          ? '?'
          : '';
        acc[ name ] = `${ config.mode }${ optionalSymbol }${ config.alias }`;
      } );

      return acc;
    }, {} as StringMap );

}

export type ParsedBindingValue = { mode: string, alias: string, optional: boolean}
export type ParsedBindingsMap = {[name:string]:ParsedBindingValue};
export type ParsedBindings = {
  inputs: ParsedBindingsMap,
  outputs: ParsedBindingsMap,
  attrs: ParsedBindingsMap,
  [key: string]: ParsedBindingsMap
};


/**
 * parses input/output/attrs string arrays from metadata fro further processing
 * @param inputs
 * @param outputs
 * @param attrs
 * @returns {{inputs: ParsedBindingsMap, outputs: ParsedBindingsMap, attrs: ParsedBindingsMap}}
 * @private
 */
export function _parseBindings({ inputs=[], outputs=[], attrs=[] }): ParsedBindings{

  const INPUT_MODE_REGEX = /^(<|=|@)?(\??)(\w*)$/;
  const SPLIT_BY = ':';

  return {
    inputs: _parseByMode( inputs, BINDING_MODE.twoWay, [ BINDING_MODE.attr ] ),
    outputs: _parseByMode( outputs, BINDING_MODE.output ),
    attrs: StringMapWrapper.merge(
      // this will be removed in 2.0
      _parseByMode( attrs, BINDING_MODE.attr ),
      // attrs build from @Input('@')
      _parseByMode( inputs, BINDING_MODE.twoWay, [ BINDING_MODE.oneWay, BINDING_MODE.twoWay ] )
    )
  };

  function _parseByMode( bindingArr: string[], defaultMode: string, excludeMode: string[] = [] ): ParsedBindingsMap {

    return bindingArr.reduce( ( acc, binding: string )=> {

      const [name,modeConfigAndAlias=''] = binding.split( SPLIT_BY ).map( part=>part.trim() );

      const [, mode=defaultMode, optional='', alias=''] = modeConfigAndAlias.match( INPUT_MODE_REGEX ) || [];

      // exit early if processed mode is not allowed
      // for example if we are parsing Input('@') which produces attr binding instead of one or two way
      if ( excludeMode.indexOf( mode ) !== -1 ) {
        return acc;
      }

      acc[ name ] = {
        mode,
        alias,
        optional: optional === BINDING_MODE.optional || true
      };

      return acc;

    }, {} as StringMap );
  }
}


/**
 * Create Bindings manually for both Directive/Component
 * @param hasIsolateScope
 * @param _scope
 * @param attributes
 * @param ctrl
 * @param metadata
 * @param {{$interpolate,$parse,$rootScope}}
 * @returns {{watchers: Array, observers: Array}}
 * @internal
 * @private
 */
export function _createDirectiveBindings(
  hasIsolateScope: boolean,
  _scope: ng.IScope,
  attributes: ng.IAttributes,
  ctrl: any,
  metadata: DirectiveMetadata,
  { $interpolate, $parse, $rootScope }: {
    $interpolate?: ng.IInterpolateService,
    $parse?: ng.IParseService,
    $rootScope?: ng.IRootScopeService
  }
): {
  initialChanges: {[key: string]: SimpleChange},
  removeWatches: Function,
  _watchers: {watchers: Function[], observers: Function[]}
} {

  /*  let BOOLEAN_ATTR = {};
   'multiple,selected,checked,disabled,readOnly,required,open'
   .split(',')
   .forEach(function(value) {
   BOOLEAN_ATTR[value.toLocaleLowerCase()] = value;
   });*/

  const scope = hasIsolateScope
    ? _scope.$parent
    : _scope;
  const { inputs=[], outputs=[], attrs=[] } = metadata;
  const parsedBindings = _parseBindings( { inputs, outputs, attrs } );
  const _internalWatchers = [];
  const _internalObservers = [];

  // onChanges tmp vars
  const initialChanges = {} as {[key: string]: SimpleChange};
  let changes;

  // this will create flush queue internally only once
  // we need to call this here because we need $rootScope service
  changesQueueService.buildFlushOnChanges( $rootScope );

  // setup @Inputs '<' or '='
  // by default '='
  StringMapWrapper.forEach( parsedBindings.inputs, ( config: ParsedBindingValue, propName: string ) => {

    const { alias, optional, mode } = config;
    const attrName = alias || propName;
    const hasTwoWayBinding = hasIsolateScope && mode === BINDING_MODE.twoWay;

    const removeWatch = hasTwoWayBinding
      ? _createTwoWayBinding( propName, attrName, optional )
      : _createOneWayBinding( propName, attrName, optional );
    _internalWatchers.push( removeWatch );

  } );

  // setup @Outputs
  StringMapWrapper.forEach( parsedBindings.outputs, ( config: ParsedBindingValue, propName: string ) => {

    const { alias, optional, mode } = config;
    const attrName = alias || propName;

    _createOutputBinding( propName, attrName, optional );

  } );

  // setup @Attrs
  StringMapWrapper.forEach( parsedBindings.attrs, ( config: ParsedBindingValue, propName: string ) => {

    const { alias, optional, mode } = config;
    const attrName = alias || propName;

    const removeObserver = _createAttrBinding( attrName, propName, optional );
    _internalObservers.push( removeObserver );

  } );

  function _createOneWayBinding( propName: string, attrName: string, optional: boolean ): Function {

    if ( !Object.hasOwnProperty.call( attributes, attrName ) ) {
      if ( optional ) return;
      attributes[ attrName ] = void 0;
    }
    if ( optional && !attributes[ attrName ] ) return;

    const parentGet = $parse( attributes[ attrName ] );

    ctrl[ propName ] = parentGet( scope );
    initialChanges[ propName ] = ChangeDetectionUtil.simpleChange( ChangeDetectionUtil.uninitialized, ctrl[ propName ] );

    return scope.$watch( parentGet, function parentValueWatchAction( newParentValue ) {
      const oldValue = ctrl[ propName ];
      recordChanges( propName, newParentValue, oldValue );
      ctrl[ propName ] = newParentValue;
    }, parentGet.literal );

  }
  function _createTwoWayBinding( propName: string, attrName: string, optional: boolean ): Function {

    let lastValue;

    if ( !Object.hasOwnProperty.call( attributes, attrName ) ) {
      if ( optional ) return;
      attributes[ attrName ] = void 0;
    }
    if ( optional && !attributes[ attrName ] ) return;

    let compare;
    const parentGet = $parse( attributes[ attrName ] );
    if (parentGet.literal) {
      compare = global.angular.equals;
    } else {
      compare = function simpleCompare(a, b) { return a === b || (a !== a && b !== b); };
    }
    const parentSet = parentGet.assign || function() {
        // reset the change, or we will throw this exception on every $digest
        lastValue = ctrl[propName] = parentGet(scope);
        throw new Error(
          `nonassign,
          Expression '${attributes[ attrName ]}' in attribute '${attrName}' used with directive '{2}' is non-assignable!`
        );
      };
    lastValue = ctrl[propName] = parentGet(scope);
    const parentValueWatch = function parentValueWatch(parentValue) {
      if (!compare(parentValue, ctrl[propName])) {
        // we are out of sync and need to copy
        if (!compare(parentValue, lastValue)) {
          // parent changed and it has precedence
          ctrl[propName] = parentValue;
        } else {
          // if the parent can be assigned then do so
          parentSet(scope, parentValue = ctrl[propName]);
        }
      }
      return lastValue = parentValue;
    };
    (parentValueWatch as any).$stateful = true;
    // NOTE: we don't support collection watch, it's not good for performance
    // if (definition.collection) {
    //   removeWatch = scope.$watchCollection(attributes[attrName], parentValueWatch);
    // } else {
    //   removeWatch = scope.$watch($parse(attributes[attrName], parentValueWatch), null, parentGet.literal);
    // }
    // removeWatchCollection.push(removeWatch);
    return scope.$watch(
      $parse( attributes[ attrName ], parentValueWatch ),
      null,
      parentGet.literal
    );

  }
  function _createOutputBinding( propName: string, attrName: string, optional: boolean ): void {

    // Don't assign Object.prototype method to scope
    const parentGet: Function = attributes.hasOwnProperty( attrName )
      ? $parse( attributes[ attrName ] )
      : noop;

    // Don't assign noop to ctrl if expression is not valid
    if (parentGet === noop && optional) return;

    ctrl[propName] = function(locals) {
      return parentGet(scope, locals);
    };

  }
  function _createAttrBinding( attrName: string, propName: string, optional: boolean ): Function {

    let lastValue;

    if ( !optional && !Object.hasOwnProperty.call( attributes, attrName ) ) {
      ctrl[ propName ] = attributes[ attrName ] = void 0;
    }

    // register watchers for further changes
    // The observer function will be invoked once during the next $digest following compilation.
    // The observer is then invoked whenever the interpolated value changes.

    const _disposeObserver = attributes.$observe( attrName, function ( value ) {
      if ( isString( value ) ) {
        const oldValue = ctrl[ propName ];
        recordChanges( propName, value, oldValue );
        ctrl[ propName ] = value;
      }
    } );

    (attributes as any).$$observers[ attrName ].$$scope = scope;
    lastValue = attributes[ attrName ];
    if ( isString( lastValue ) ) {
      // If the attribute has been provided then we trigger an interpolation to ensure
      // the value is there for use in the link fn
      ctrl[ propName ] = $interpolate( lastValue )( scope );
    } else if ( isBoolean( lastValue ) ) {
      // If the attributes is one of the BOOLEAN_ATTR then Angular will have converted
      // the value to boolean rather than a string, so we special case this situation
      ctrl[ propName ] = lastValue;
    }

    initialChanges[ propName ] = ChangeDetectionUtil.simpleChange( ChangeDetectionUtil.uninitialized, ctrl[ propName ] );
    return _disposeObserver;

  }

  function recordChanges<T>( key: string, currentValue: T, previousValue: T ): void {
    if (isFunction(ctrl.ngOnChanges) && currentValue !== previousValue) {
      // If we have not already scheduled the top level onChangesQueue handler then do so now
      if (!changesQueueService.onChangesQueue) {
        (scope as any).$$postDigest(changesQueueService.flushOnChangesQueue);
        changesQueueService.onChangesQueue = [];
      }
      // If we have not already queued a trigger of onChanges for this controller then do so now
      if (!changes) {
        changes = {};
        changesQueueService.onChangesQueue.push(triggerOnChangesHook);
      }
      // If the has been a change on this property already then we need to reuse the previous value
      if (changes[key]) {
        previousValue = changes[key].previousValue;
      }
      // Store this change
      changes[key] = ChangeDetectionUtil.simpleChange(previousValue, currentValue);
    }
  }

  function triggerOnChangesHook(): void {
    ctrl.ngOnChanges( changes );
    // Now clear the changes so that we schedule onChanges when more changes arrive
    changes = undefined;
  }

  function removeWatches(): void {
    const removeWatchCollection = [ ..._internalWatchers, ..._internalObservers ];
    for ( var i = 0, ii = removeWatchCollection.length; i < ii; ++i ) {
      removeWatchCollection[ i ]();
    }
  }

  return {
    initialChanges,
    removeWatches,
    _watchers: { watchers: _internalWatchers, observers: _internalObservers }
  };

}
