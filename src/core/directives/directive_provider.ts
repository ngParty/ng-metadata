import {DirectiveResolver} from "../linker/directive_resolver";
import {Type,assign,isBlank,isPresent,isFunction,noop,resolveDirectiveNameFromSelector} from "../../facade/lang";
import {StringWrapper} from "../../facade/primitives";
import {StringMapWrapper} from "../../facade/collections";
import {hasLifecycleHook} from "../linker/directive_lifecycles_reflector";
import {LifecycleHooks} from "../linker/directive_lifecycle_interfaces";
import {DirectiveMetadata,ComponentMetadata,LegacyDirectiveDefinition} from "./metadata_directives";
import {stringify} from '../../facade/lang';

export type HostBindingsProcessed = {
  classes: StringMap,
  attributes: StringMap,
  properties: StringMap
}
export type HostListenersProcessed = {[key:string]:string[]};
export type HostProcessed = {
  hostStatic: StringMap,
  hostBindings: HostBindingsProcessed,
  hostListeners: HostListenersProcessed
}

/**
 * @internal
 */
export class DirectiveProvider {

  constructor( private directiveResolver: DirectiveResolver ) {}

  private static _ddoShell = {
    require: [],
    controller: noop,
    link: { pre: noop, post: noop }
  };
  private static _controllerAs = `$ctrl`;
  private static _transclude = false;

  /**
   * creates directiveName and DirectiveFactory for angularJS container
   *
   * it produces directive for classes decorated with @Directive with following DDO:
   * ```
   * {
   * require: ['directiveName'],
   * controller: ClassDirective,
   * link: postLinkFn
   * }
   * ```
   *
   * it produces component for classes decorated with @Component with following DDO:
   * ```
   * {
   * require: ['directiveName'],
   * controller: ClassDirective,
   * controllerAs: '$ctrl',
   * template: 'component template string',
   * scope:{},
   * bindToController:{},
   * transclude: false,
   * link: postLinkFn
   * }
   * ```
   * @param type
   * @returns {string|function(): ng.IDirective[]}
   */
  createFromType( type: Type ): [string,ng.IDirectiveFactory] {

    const metadata: DirectiveMetadata | ComponentMetadata = this.directiveResolver.resolve( type );
    const directiveName = resolveDirectiveNameFromSelector( metadata.selector );
    const requireMap = this.directiveResolver.getRequiredDirectivesMap( type );
    const lfHooks = {
      ngOnInit: hasLifecycleHook( LifecycleHooks.OnInit, type ),
      ngAfterContentInit: hasLifecycleHook( LifecycleHooks.AfterContentInit, type ),
      ngAfterViewInit: hasLifecycleHook( LifecycleHooks.AfterViewInit, type ),
      ngOnDestroy: hasLifecycleHook( LifecycleHooks.OnDestroy, type )
    };

    const {inputs,attrs,outputs,host,queries,legacy} = metadata;

    let _ddo = {} as ng.IDirective;
    const _basicDDO = {
      controller: type,
      require: this._createRequires( requireMap, directiveName ),
    } as ng.IDirective;

    if ( metadata instanceof ComponentMetadata ) {

      const componentSpecificDDO = {
        scope: {},
        bindToController: this._createComponentBindings( inputs, attrs, outputs ),
        controllerAs: DirectiveProvider._controllerAs,
        link: this._createLink( type, metadata, lfHooks, requireMap ),
        transclude: DirectiveProvider._transclude
      } as ng.IDirective;

      if ( metadata.template && metadata.templateUrl ) {
        throw new Error( 'cannot have both template and templateUrl' );
      }
      if ( metadata.template ) {
        componentSpecificDDO.template = metadata.template;
      }
      if ( metadata.templateUrl ) {
        componentSpecificDDO.templateUrl = metadata.templateUrl;
      }

      StringMapWrapper.assign( _ddo, _basicDDO, componentSpecificDDO );

    } else {

      const directiveSpecificDDO = {
        link: this._createLink( type, metadata, lfHooks, requireMap )
      } as ng.IDirective;

      StringMapWrapper.assign( _ddo, _basicDDO, directiveSpecificDDO );

    }

    const ddo = this._createDDO( _ddo, metadata.legacy );

    return [
      directiveName,
      function directiveFactory() { return ddo }
    ]

  }

  _createDDO( ddo: ng.IDirective, legacyDDO: LegacyDirectiveDefinition ): ng.IDirective {
    return assign(
      {},
      DirectiveProvider._ddoShell,
      ddo,
      legacyDDO
    )
  }

  /**
   *
   * @param inputs
   * @param attrs
   * @param outputs
   * @returns {{}}
   * @private
   * @internal
   */
  _createComponentBindings(
    inputs: string[] = [],
    attrs: string[] = [],
    outputs: string[] = []
  ): StringMap {

    const inputsBindings = _extractBindings( inputs, '=' );
    const attrsBindings = _extractBindings( attrs, '@' );
    const outputsBindings = _extractBindings( outputs, '&' );

    return assign(
      {},
      inputsBindings,
      attrsBindings,
      outputsBindings
    );

  }

  /**
   *
   * @param requireMap
   * @param directiveName
   * @returns {Array}
   * @private
   * @internal
   */
  _createRequires( requireMap: StringMap, directiveName: string ): string[] {

    return [ directiveName, ...StringMapWrapper.values( requireMap ) ];

  }

  _processHost( host: StringMap ): HostProcessed {

    if ( !isPresent( host ) ) {
      return;
    }

    const HOST_BINDING_KEY_REGEX = /^\[.*\]$/;
    const HOST_LISTENER_KEY_REGEX = /^\(.*\)$/;
    const HAS_CLASS_REGEX = /^class./;
    const HAS_ATTR_REGEX = /^attr./;

    const hostStatic = {} as StringMap;
    const hostBindingsRaw = [];
    const hostListeners = {} as {[key:string]:string[]};

    StringMapWrapper.forEach( host, ( hostValue: string, hostKey: string )=> {

      const hostMap: StringMap = { [stripBindingOrListenerBrackets( hostKey )]: hostValue };

      if ( isStaticHost( hostKey ) ) {
        assign( hostStatic, hostMap );
        return;
      }
      if ( isHostBinding( hostKey ) ) {
        hostBindingsRaw.push( hostMap );
        return;
      }
      if ( isHostListener( hostKey ) ) {
        assign( hostListeners, processHostListenerCallback( hostMap ) );
      }

    } );

    const hostBindings: HostBindingsProcessed = hostBindingsRaw
      .reduce(
        ( acc, hostBindingObj )=> {

          const [hostObjKey] = Object.keys( hostBindingObj );
          const hostObjValue = hostBindingObj[ hostObjKey ];

          if ( HAS_CLASS_REGEX.test( hostObjKey ) ) {
            acc.classes[ hostObjKey.replace( HAS_CLASS_REGEX, '' ) ] = hostObjValue;
            return acc;
          }

          if ( HAS_ATTR_REGEX.test( hostObjKey ) ) {

            acc.attributes[ hostObjKey.replace( HAS_ATTR_REGEX, '' ) ] = hostObjValue;
            return acc;
          }

          assign( acc.properties, hostBindingObj );

          return acc;
        },
        {
          classes: {},
          attributes: {},
          properties: {}
        }
      );

    return {
      hostStatic,
      hostBindings,
      hostListeners
    };

    function isHostBinding( hostKey ) {
      return HOST_BINDING_KEY_REGEX.test( hostKey );
    }

    function isHostListener( hostKey ) {
      return HOST_LISTENER_KEY_REGEX.test( hostKey );
    }

    function isStaticHost( hostKey ) {
      return !(isHostBinding( hostKey ) || isHostListener( hostKey ));
    }

    function stripBindingOrListenerBrackets( hostKey ): string {
      return hostKey.replace( /\[|\]|\(|\)/g, '' );
    }

    function processHostListenerCallback( hostListener: {[key:string]:string} ): {[key:string]:string[]} {
      const [eventName] = Object.keys( hostListener );
      const cbString = hostListener[ eventName ];

      const [,cbMethodName,cbMethodArgs] = /^(\w+)\(([$\w.,]*)\)$/.exec( cbString );

      return {
        [eventName]: [
          cbMethodName,
          // filter out empty values and trim values
          ...cbMethodArgs.split( ',' ).filter( argument=>Boolean( argument ) ).map( argument=>argument.trim() )
        ]
      };
    }

  }

  /**
   * Directive lifeCycles:
   * - ngOnInit from preLink (all children compiled and DOM ready)
   * - ngAfterContentInit from postLink ( DOM in children ready )
   * - ngOnDestroy from postLink
   *
   * Component lifeCycles:
   * - ngOnInit from preLink (controller require ready)
   * - ngAfterViewInit from postLink ( all children in view+content compiled and DOM ready )
   * - ngOnDestroy from postLink
   * @param type
   * @param metadata
   * @param lfHooks
   * @param requireMap
   * @private
   * @internal
   */
  _createLink(
    type: Type,
    metadata: DirectiveMetadata | ComponentMetadata,
    lfHooks: {ngOnInit:boolean,ngAfterContentInit: boolean, ngAfterViewInit: boolean, ngOnDestroy: boolean},
    requireMap: StringMap
  ): ng.IDirectiveLinkFn | ng.IDirectivePrePost {

    const requiredCtrlVarNames = Object.keys( requireMap );
    const hostProcessed = this._processHost( metadata.host );
    // @TODO
    //const queriesProcessed;
    let preLink: ng.IDirectiveLinkFn;
    let postLink: ng.IDirectiveLinkFn;

    // preLink
    if ( lfHooks.ngOnInit ) {
      preLink = _preLinkFnFactory(requiredCtrlVarNames);
    }

    // postLink
    if ( metadata instanceof ComponentMetadata ) {

      if ( lfHooks.ngAfterContentInit && lfHooks.ngAfterViewInit ) {

        throw new Error( `
        Hooks Impl for ${ stringify( type ) }:
        ===================================
        You cannot implement both AfterContentInit and AfterViewInit, because they're doing the same in
        component context. For Components please prefer AfterViewInit
        ` )

      }

      postLink = function (
        scope: ng.IScope,
        element: ng.IAugmentedJQuery,
        attrs: ng.IAttributes,
        controller: any[],
        transclude
      ) {

        const _watchers = [];
        const [ctrl,...requiredCtrls] = controller;

        // if OnInit implemented don't create controller properties again
        if ( !lfHooks.ngOnInit ) {
          _assignRequiredCtrlInstancesToHostCtrl( requiredCtrlVarNames, requiredCtrls, ctrl );
        }

        _setHostStaticAttributes( element, hostProcessed.hostStatic );

        // setup @HostBindings
        _watchers.push(
          ..._setHostBindings( scope, element, ctrl, hostProcessed.hostBindings )
        );

        // setup @HostListeners
        _setHostListeners( scope, element, ctrl, hostProcessed.hostListeners );

        // AfterContentInit/AfterViewInit Hooks
        // call one of those methods if implemented
        if ( lfHooks.ngAfterViewInit || lfHooks.ngAfterContentInit ) {
          (ctrl[ 'ngAfterContentInit'] || ctrl['ngAfterViewInit' ])();
        }

        // destroy
        _setupDestroyHandler( scope, element, ctrl, lfHooks.ngOnDestroy, _watchers );

      }


    } else {

      // Directive postLink
      if ( lfHooks.ngAfterViewInit ) {

        throw new Error( `
        Hooks Impl for ${ stringify( type ) }:
        ===================================
        You cannot implement AfterViewInit for @Directive,
        because directive doesn't have View so you probably doing something wrong.
        @Directive support only AfterContentInit hook which is triggered from postLink
        ` )

      }

      postLink = function (
        scope: ng.IScope,
        element: ng.IAugmentedJQuery,
        attributes: ng.IAttributes,
        controller: any[],
        transclude
      ) {

        const _watchers = [];
        const _observers = [];
        const [ctrl,...requiredCtrls] = controller;

        // if OnInit implemented don't create controller properties again
        if ( !lfHooks.ngOnInit ) {
          _assignRequiredCtrlInstancesToHostCtrl( requiredCtrlVarNames, requiredCtrls, ctrl );
        }

        const _disposables = _createDirectiveBindings( scope, attributes, ctrl, metadata );
        _watchers.push( ..._disposables.watchers );
        _observers.push( ..._disposables.observers );


        _setHostStaticAttributes( element, hostProcessed.hostStatic );

        // setup @HostBindings
        _watchers.push(
          ..._setHostBindings( scope, element, ctrl, hostProcessed.hostBindings )
        );

        // setup @HostListeners
        _setHostListeners( scope, element, ctrl, hostProcessed.hostListeners );

        // AfterContent Hooks
        if ( lfHooks.ngAfterContentInit ) {
          ctrl.ngAfterContentInit();
        }

        // destroy
        _setupDestroyHandler( scope, element, ctrl, lfHooks.ngOnDestroy, _watchers, _observers );

      }

    }

    return isFunction( preLink )
      ? { pre: preLink, post: postLink }
      : postLink;

  }

}


// private helpers

/**
 * creates preLink Function
 * assigns required controller instances to current directive instance
 * Note: it is not safe to do following in preLink:
 *  - attaching event listeners
 *  - doing DOM manipulation
 * @private
 */
function _preLinkFnFactory(requiredCtrlVarNames: string[]) {

  return function preLink( scope, element, attrs, controller, transclude ) {

    const [ctrl,...requiredCtrls] = controller;
    _assignRequiredCtrlInstancesToHostCtrl( requiredCtrlVarNames, requiredCtrls, ctrl );

    ctrl.ngOnInit();

  }

}

/**
 *
 * @param scope
 * @param element
 * @param ctrl
 * @param implementsNgOnDestroy
 * @param watchersToDispose
 * @param observersToDispose
 * @private
 */
function _setupDestroyHandler(
  scope: ng.IScope,
  element: ng.IAugmentedJQuery,
  ctrl: any,
  implementsNgOnDestroy: boolean,
  watchersToDispose: Function[] = [],
  observersToDispose: Function[] = []
): void {

  scope.$on( '$destroy', ()=> {

    if ( implementsNgOnDestroy ) {

      ctrl.ngOnDestroy();

    }

    watchersToDispose.forEach( _watcherDispose=>_watcherDispose() );
    observersToDispose.forEach( _observerDispose=>_observerDispose() );
    element.off();

  } );

}

/**
 *
 * @param requiredCtrlVarNames
 * @param requiredCtrls
 * @param ctrl
 * @internal
 * @private
 */
export function _assignRequiredCtrlInstancesToHostCtrl(
  requiredCtrlVarNames: string[],
  requiredCtrls: Object[],
  ctrl: any
): void {
  requiredCtrlVarNames.forEach( ( varName, idx )=>ctrl[ varName ] = requiredCtrls[ idx ] );
}

/**
 *
 * @param element
 * @param staticAttributes
 * @private
 */
function _setHostStaticAttributes( element: ng.IAugmentedJQuery, staticAttributes: StringMap ): void {
  element.attr( staticAttributes );
}

/**
 *
 * @param scope
 * @param element
 * @param ctrl
 * @param hostBindings
 * @returns {Array}
 * @internal
 * @private
 */
export function _setHostBindings(
  scope: ng.IScope,
  element: ng.IAugmentedJQuery,
  ctrl: any,
  hostBindings: HostBindingsProcessed
): Function[] {

  // setup @HostBindings
  return [
    ..._createWatcherByType( 'classes', hostBindings ),
    ..._createWatcherByType( 'attributes', hostBindings ),
    ..._createWatcherByType( 'properties', hostBindings )
  ];

  /**
   * registers $scope.$watch for appropriate hostBinding
   * the watcher watches property on controller instance
   * @param type
   * @param hostBinding
   * @returns {Array}
   * @private
   */
  function _createWatcherByType( type: string, hostBinding: HostBindingsProcessed ): Function[] {

    const _watchersByType = [];

    StringMapWrapper.forEach(
      hostBinding[ type ],
      ( watchPropName: string, keyToSet: string )=> {

        _watchersByType.push(
          scope.$watch(
            ()=>ctrl[ watchPropName ],
            ( newValue )=> {

              if ( type === 'classes' ) {
                element.toggleClass( keyToSet, newValue )
              }
              if ( type === 'attributes' ) {
                element.attr( keyToSet, newValue )
              }
              if ( type === 'properties' ) {
                StringMapWrapper.setValueInPath( element[ 0 ], keyToSet, newValue )
              }
            }
          )
        )

      }
    );

    return _watchersByType;

  }

}

/**
 *
 * @param scope
 * @param element
 * @param ctrl
 * @param hostListeners
 * @internal
 * @private
 */
export function _setHostListeners( scope: ng.IScope, element: ng.IAugmentedJQuery, ctrl: any, hostListeners: HostListenersProcessed ): void {

  StringMapWrapper.forEach(
    hostListeners,
    ( cbArray: string[], eventName: string ) => {

      const [methodName,...methodParams] = cbArray;

      element.on( eventName, ( evt )=> {

        const cbParams: any[] = _getHostListenerCbParams( evt, methodParams );

        scope.$applyAsync( ()=> {

          const noPreventDefault = ctrl[ methodName ]( ...cbParams );

          // HostListener preventDefault if method name returns false,
          // which is default if you don't explicitly return truthy value
          if ( !noPreventDefault ) {
            evt.preventDefault();
          }

        } );

      } );

    }
  );

}

/**
 * return $event or it's property if found via path
 * @param event
 * @param eventParams
 * @returns {Array}
 * @private
 */
export function _getHostListenerCbParams( event: any, eventParams: string[] ): any[] {

  const ALLOWED_EVENT_NAME = '$event';

  return eventParams.reduce(
    ( acc, eventPath: string )=> {

      if ( !StringWrapper.startsWith( eventPath, ALLOWED_EVENT_NAME ) ) {
        throw new Error( `
              only $event.* is supported. Please provide correct listener parameter @example: $event,$event.target
              ` );
      }

      if ( eventPath === ALLOWED_EVENT_NAME ) {
        return [ ...acc, event ];
      }

      return [ ...acc, StringMapWrapper.getValueFromPath( event, eventPath.replace( ALLOWED_EVENT_NAME, '' ) ) ];

    },
    []
  );
}

/**
 *
 * @param scope
 * @param attributes
 * @param ctrl
 * @param metadata
 * @returns {{watchers: Array, observers: Array}}
 * @internal
 * @private
 */
export function _createDirectiveBindings(
  scope: ng.IScope,
  attributes: ng.IAttributes,
  ctrl: any,
  metadata: DirectiveMetadata
): {watchers:Function[], observers:Function[]} {

  const {inputs=[],outputs=[],attrs=[]} = metadata;
  const _internalWatchers = [];
  const _internalObservers = [];

  // setup @Inputs
  StringMapWrapper.forEach( _extractBindings( inputs ), ( alias: string, propName: string )=> {
    _internalWatchers.push(
      scope.$watch(
        attributes[ alias || propName ],
        ( newValue )=> {
          ctrl[ propName ] = newValue
        }
      )
    )
  } );
  // setup @Outputs
  StringMapWrapper.forEach( _extractBindings( outputs ), ( alias: string, propName: string )=> {
    ctrl[ propName ] = ()=> scope.$eval( alias || propName );
  } );
  // setup @Attrs
  StringMapWrapper.forEach( _extractBindings( attrs ), ( alias: string, propName: string )=> {
    _internalObservers.push(
      attributes.$observe(
        alias || propName,
        ( newValue )=> {
          ctrl[ propName ] = newValue
        }
      )
    )
  } );

  return {
    watchers: _internalWatchers,
    observers: _internalObservers
  };

}

/**
 *
 * @param bindings
 * @param typeSymbol
 * @param SPLIT_BY
 * @returns {StringMap}
 * @internal
 * @private
 */
export function _extractBindings( bindings: string[], typeSymbol: string = '', SPLIT_BY = ':' ): StringMap {

  return bindings.reduce( ( acc, binding: string )=> {

    const [name,alias=''] = binding.split( SPLIT_BY ).map( part=>part.trim() );
    acc[ name ] = `${ typeSymbol }${ alias }`;

    return acc;

  }, {} as StringMap );

}


export const directiveProvider = new DirectiveProvider( new DirectiveResolver() );

