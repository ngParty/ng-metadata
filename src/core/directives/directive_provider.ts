import { DirectiveResolver } from '../linker/directive_resolver';
import {
  assign,
  isPresent,
  isFunction,
  noop,
  resolveDirectiveNameFromSelector,
  stringify,
  isJsObject
} from '../../facade/lang';
import { StringWrapper } from '../../facade/primitives';
import { StringMapWrapper } from '../../facade/collections';
import { resolveImplementedLifeCycleHooks, ImplementedLifeCycleHooks } from '../linker/directive_lifecycles_reflector';
import {
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked,
  OnInit,
  OnDestroy,
  OnChildrenChanged,
  ChildrenChangeHook,
  OnChanges,
  DoCheck
} from '../linker/directive_lifecycle_interfaces';
import { DirectiveMetadata, ComponentMetadata, LegacyDirectiveDefinition } from './metadata_directives';
import {
  QueryMetadata,
  ViewChildMetadata,
  ViewChildrenMetadata,
  ViewQueryMetadata,
  ContentChildMetadata,
  ContentChildrenMetadata
} from './metadata_di';
import {
  _resolveChildrenFactory,
  _getParentCheckNotifiers,
  directiveControllerFactory,
  _extractBindings
} from './util/util';

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
export interface DirectiveCtrl extends
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked,
  OnInit,
  OnDestroy,
  OnChanges,
  DoCheck,
  OnChildrenChanged {
  __readChildrenOrderScheduled?: boolean
  __readViewChildrenOrderScheduled?: boolean
  __readContentChildrenOrderScheduled?: boolean
}
export interface NgmDirective extends ng.IDirective {
  _ngOnInitBound?():void;
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
    const lfHooks = resolveImplementedLifeCycleHooks(type);
    const {inputs,attrs,outputs,host,queries,legacy} = metadata;

    const _ddo = {
      controller: _controller,
      link: {
        pre: function () { _ddo._ngOnInitBound() },
        post: this._createLink( type, metadata, lfHooks )
      },
      // @TODO this will be removed after @Query handling is moved to directiveControllerFactory
      require: this._createRequires( requireMap, directiveName ),
      _ngOnInitBound: noop
    } as NgmDirective;

    // Component controllers must be created from a factory. Checkout out
    // util/directive-controller.js for more information about what's going on here
    _controller.$inject = ['$scope', '$element', '$attrs', '$transclude', '$injector'];
    function _controller($scope: any, $element: any, $attrs: any, $transclude: any, $injector: any): any{

      const locals = { $scope, $element, $attrs, $transclude };

      return directiveControllerFactory( this, type, $injector, locals, requireMap, _ddo, metadata );

    }

    // specific DDO augmentation for @Component
    if ( metadata instanceof ComponentMetadata ) {

      const componentSpecificDDO = {
        scope: {},
        bindToController: {},
        controllerAs: DirectiveProvider._controllerAs,
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

      StringMapWrapper.assign( _ddo, componentSpecificDDO );

    }

    // allow compile defined as static method on Type
    if ( isFunction( (type as any).compile ) ) {
      _ddo.compile = function compile( tElement, tAttrs ) {
        const linkFn = (type as any).compile( tElement, tAttrs );

        // if user custom compile fn returns link use that one instead use generated
        return isJsObject( linkFn )
          ? linkFn
          : this.link;
      }
    }

    // allow link defined as static method on Type override the created one
    // you should not use this very often
    // Note: if you use this any @Host property decorators or lifeCycle hooks wont work
    if ( isFunction((type as any).link) ) {
      _ddo.link = (type as any).link;
    }

    // legacy property overrides all generated DDO stuff
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
   * NOTE: this is not used anymore
   * we are creating bindings manually
   * @param inputs
   * @param attrs
   * @param outputs
   * @returns {{}}
   * @private
   * @internal
   * @deprecated
   */
  _createComponentBindings(
    inputs: string[] = [],
    attrs: string[] = [],
    outputs: string[] = []
  ): StringMap {

    return _extractBindings( { inputs, outputs, attrs } );

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

      // eventKey is 'click' or 'document: click' etc
      const [eventKey] = Object.keys( hostListener );
      // cbString is just value 'onMove($event.target)' or 'onMove()'
      const cbString = hostListener[ eventKey ];
      // here we parse out callback method and its argument to separate strings
      // - for instance we got from 'onMove($event.target)' --> 'onMove','$event.target'
      const [,cbMethodName,cbMethodArgs] = /^(\w+)\(([$\w.\s,]*)\)$/.exec( cbString );
      const eventValue = [
        cbMethodName,
        // filter out empty values and trim values
        ...cbMethodArgs.split( ',' ).filter( argument=>Boolean( argument ) ).map( argument=>argument.trim() )
      ];

      return {
        [eventKey.replace( /\s/g, '' )]: eventValue
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
   * - ngAfterContentInit from postLink ( same as ngAfterViewInit )
   * - ngOnDestroy from postLink
   * @param type
   * @param metadata
   * @param lfHooks
   * @private
   * @internal
   */
  _createLink(
    type: Type,
    metadata: DirectiveMetadata | ComponentMetadata,
    lfHooks: ImplementedLifeCycleHooks
  ): ng.IDirectiveLinkFn {

    if ( (lfHooks.ngAfterContentChecked || lfHooks.ngAfterViewChecked) && StringMapWrapper.size(metadata.queries)===0 ) {
      throw new Error( `
              Hooks Impl for ${ stringify( type ) }:
              ===================================
              You've implement AfterContentChecked/AfterViewChecked lifecycle, but @ViewChild(ren)/@ContentChild(ren) decorators are not used.
              we cannot invoke After(Content|View)Checked without provided @Query decorators
              ` )
    }

    // we need to implement this if query are present on class, because during postLink _ngOnChildrenChanged is not yet
    // implemented on controller instance
    if ( StringMapWrapper.size(metadata.queries) ) {
      type.prototype._ngOnChildrenChanged = noop;
    }

    const hostProcessed = this._processHost( metadata.host );

    let postLink: ng.IDirectiveLinkFn;

    // postLink
    if ( metadata instanceof ComponentMetadata ) {


      if ( (lfHooks.ngAfterContentInit || lfHooks.ngAfterContentChecked) && !StringMapWrapper.getValueFromPath( metadata,
          'legacy.transclude' ) ) {
        throw new Error( `
              Hooks Impl for ${ stringify( type ) }:
              ===================================
              You cannot implement AfterContentInit lifecycle, without allowed transclusion.
              turn transclusion on within decorator like this: @Component({legacy:{transclude:true}})
              ` )
      }

      postLink = function (
        scope: ng.IScope,
        element: ng.IAugmentedJQuery,
        attrs: ng.IAttributes,
        controller: [DirectiveCtrl,any],
        transclude?: ng.ITranscludeFunction
      ) {

        const _watchers = [];
        const [ctrl,...requiredCtrls] = controller;

        _setHostStaticAttributes( element, hostProcessed.hostStatic );

        // setup @HostBindings
        _watchers.push(
          ..._setHostBindings( scope, element, ctrl, hostProcessed.hostBindings )
        );

        // setup @HostListeners
        _setHostListeners( scope, element, ctrl, hostProcessed.hostListeners );

        const parentCheckedNotifiers = _getParentCheckNotifiers(ctrl,requiredCtrls);
        _watchers.push(...parentCheckedNotifiers);
        // setup @ContentChild/@ContentChildren/@ViewChild/@ViewChildren
         _setQuery( scope, element, ctrl, metadata.queries );


        // AfterContentInit/AfterViewInit Hooks
        // if there are query defined schedule $evalAsync semaphore
        if ( StringMapWrapper.size( metadata.queries ) ) {

          ctrl._ngOnChildrenChanged( ChildrenChangeHook.FromView, [
            parentCheckedNotifiers.forEach(cb=>cb()),
            ctrl.ngAfterViewInit && ctrl.ngAfterViewInit.bind( ctrl ),
            ctrl.ngAfterViewChecked && ctrl.ngAfterViewChecked.bind( ctrl ),
          ] );
          ctrl._ngOnChildrenChanged( ChildrenChangeHook.FromContent, [
            parentCheckedNotifiers.forEach(cb=>cb()),
            ctrl.ngAfterContentInit && ctrl.ngAfterContentInit.bind( ctrl ),
            ctrl.ngAfterContentChecked && ctrl.ngAfterContentChecked.bind( ctrl ),
          ] );

        } else {

          parentCheckedNotifiers.forEach(cb=>cb());
          ctrl.ngAfterViewInit && ctrl.ngAfterViewInit();
          ctrl.ngAfterContentInit && ctrl.ngAfterContentInit();

        }

        // destroy
        _setupDestroyHandler( scope, element, ctrl, lfHooks.ngOnDestroy, _watchers );

      }


    } else {

      // Directive postLink
      if ( lfHooks.ngAfterViewInit || lfHooks.ngAfterViewChecked ) {

        throw new Error( `
        Hooks Impl for ${ stringify( type ) }:
        ===================================
        You cannot implement AfterViewInit/AfterViewChecked for @Directive,
        because directive doesn't have View so you probably doing something wrong.
        @Directive support only AfterContentInit/AfterContentChecked hook which is triggered from postLink
        ` )

      }

      postLink = function (
        scope: ng.IScope,
        element: ng.IAugmentedJQuery,
        attributes: ng.IAttributes,
        controller: [DirectiveCtrl,any],
        transclude: ng.ITranscludeFunction
      ) {

        const _watchers = [];
        const _observers = [];
        const [ctrl,...requiredCtrls] = controller;


        _setHostStaticAttributes( element, hostProcessed.hostStatic );

        // setup @HostBindings
        _watchers.push(
          ..._setHostBindings( scope, element, ctrl, hostProcessed.hostBindings )
        );

        // setup @HostListeners
        _setHostListeners( scope, element, ctrl, hostProcessed.hostListeners );

        const parentCheckedNotifiers = _getParentCheckNotifiers(ctrl,requiredCtrls);
        _watchers.push(...parentCheckedNotifiers);

        // setup @ContentChild/@ContentChildren
        _setQuery( scope, element, ctrl, metadata.queries );

        // AfterContent Hooks
        // if there are query defined schedule $evalAsync semaphore
        if ( StringMapWrapper.size( metadata.queries ) ) {
          ctrl._ngOnChildrenChanged( ChildrenChangeHook.FromContent, [
            parentCheckedNotifiers.forEach(cb=>cb()),
            ctrl.ngAfterContentInit && ctrl.ngAfterContentInit.bind( ctrl ),
            ctrl.ngAfterContentChecked && ctrl.ngAfterContentChecked.bind( ctrl )
          ] );
        } else {
          // no @ContentChild(ren) decorators exist, call just controller init method
          parentCheckedNotifiers.forEach(cb=>cb());
          ctrl.ngAfterContentInit && ctrl.ngAfterContentInit();
        }

        // destroy
        _setupDestroyHandler( scope, element, ctrl, lfHooks.ngOnDestroy, _watchers, _observers );

      }

    }

    return postLink;

  }

}


// private helpers

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
export function _setupDestroyHandler(
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
export function _setHostListeners(
  scope: ng.IScope,
  element: ng.IAugmentedJQuery,
  ctrl: any,
  hostListeners: HostListenersProcessed
): void {

  StringMapWrapper.forEach( hostListeners, _registerHostListener );

  function _registerHostListener( cbArray: string[], eventKey: string ): void {

    const [methodName,...methodParams] = cbArray;
    const { event, target } = _getTargetAndEvent( eventKey, element );

    // console.log( event );
    target.on( event, eventHandler );

    // global event
    if ( target !== element ) {
      scope.$on( '$destroy', () => target.off( event as any, eventHandler ) );
    }

    function eventHandler( evt ) {

      const cbParams: any[] = _getHostListenerCbParams( evt, methodParams );

      scope.$applyAsync( ()=> {

        const noPreventDefault = ctrl[ methodName ]( ...cbParams );

        // HostListener preventDefault if method name returns false,
        // which is default if you don't explicitly return truthy value
        if ( !noPreventDefault ) {
          evt.preventDefault();
        }

      } );

    }

  }

}

function _getGlobalTargetReference( $injector: ng.auto.IInjectorService, targetName: string ): ng.IAugmentedJQuery {

  const globalEventTargets = [ 'document', 'window', 'body' ];
  const $document = $injector.get<ng.IDocumentService>( `$document` );

  if ( targetName === 'document' ) {
    return $document;
  }

  if ( targetName === 'window' ) {
    return angular.element( $injector.get<ng.IWindowService>( `$${targetName}` ) );
  }

  if ( targetName === 'body' ) {
    return angular.element($document[ 0 ][ targetName ]);
  }

  throw new Error(`unsupported global target '${targetName}', only '${globalEventTargets}' are supported`)
}

/**
 *
 * @param definedHostEvent this will be just simple 'event' string name or 'globalTarget:event'
 * @param hostElement
 * @returns {any}
 * @private
 */
function _getTargetAndEvent(
  definedHostEvent: string,
  hostElement: ng.IAugmentedJQuery
): {event: string,target: ng.IAugmentedJQuery} {

  // global target
  const eventWithGlobalTarget = definedHostEvent.split(/\s*:\s*/);

  if ( eventWithGlobalTarget.length === 2 ) {
    const [globalTarget,eventOnTarget] = eventWithGlobalTarget;

    return {
      event: eventOnTarget,
      target: _getGlobalTargetReference( hostElement.injector(), globalTarget )
    };
  }

  return {
    event: definedHostEvent,
    target: hostElement
  };
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
 * setups watchers for children component/directives provided by @Query decorators
 * @param scope
 * @param element
 * @param ctrl
 * @param queries
 * @private
 */
export function _setQuery(
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




export const directiveProvider = new DirectiveProvider( new DirectiveResolver() );

