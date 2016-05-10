import { DirectiveResolver } from '../linker/directive_resolver';
import { assign, isFunction, noop, resolveDirectiveNameFromSelector, stringify, isJsObject } from '../../facade/lang';
import { StringMapWrapper } from '../../facade/collections';
import { resolveImplementedLifeCycleHooks, ImplementedLifeCycleHooks } from '../linker/directive_lifecycles_reflector';
import { ChildrenChangeHook } from '../linker/directive_lifecycle_interfaces';
import { DirectiveMetadata, ComponentMetadata, LegacyDirectiveDefinition } from './metadata_directives';
import { directiveControllerFactory } from './controller/controller_factory';
import { _getParentCheckNotifiers, _setupQuery } from './query/children_resolver';
import { _parseHost } from './host/host_parser';
import { _setHostStaticAttributes, _setHostBindings, _setHostListeners } from './host/host_resolver';
import { _setupDestroyHandler } from './directives_utils';
import { NgmDirective, DirectiveCtrl } from './constants';

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
  createFromType( type: Type ): [string, ng.IDirectiveFactory] {

    const metadata: DirectiveMetadata | ComponentMetadata = this.directiveResolver.resolve( type );
    const directiveName = resolveDirectiveNameFromSelector( metadata.selector );
    const requireMap = this.directiveResolver.getRequiredDirectivesMap( type );
    const lfHooks = resolveImplementedLifeCycleHooks(type);
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

    if ( (lfHooks.ngAfterContentChecked || lfHooks.ngAfterViewChecked) && StringMapWrapper.size( metadata.queries ) === 0 ) {
      throw new Error( `
              Hooks Impl for ${ stringify( type ) }:
              ===================================
              You've implement AfterContentChecked/AfterViewChecked lifecycle, but @ViewChild(ren)/@ContentChild(ren) decorators are not used.
              we cannot invoke After(Content|View)Checked without provided @Query decorators
              ` )
    }
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
    }

    // we need to implement this if query are present on class, because during postLink _ngOnChildrenChanged is not yet
    // implemented on controller instance
    if ( StringMapWrapper.size( metadata.queries ) ) {
      type.prototype._ngOnChildrenChanged = noop;
    }

    const hostProcessed = _parseHost( metadata.host );

    return postLink;

    function postLink(
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

      // @ContentChild/@ContentChildren/@ViewChild/@ViewChildren related logic
      const parentCheckedNotifiers = _getParentCheckNotifiers( ctrl, requiredCtrls );
      _watchers.push( ...parentCheckedNotifiers );
      _setupQuery( scope, element, ctrl, metadata.queries );

      // AfterContentInit/AfterViewInit Hooks
      // if there are query defined schedule $evalAsync semaphore
      if ( StringMapWrapper.size( metadata.queries ) ) {

        ctrl._ngOnChildrenChanged( ChildrenChangeHook.FromView, [
          parentCheckedNotifiers.forEach( cb=>cb() ),
          ctrl.ngAfterViewInit && ctrl.ngAfterViewInit.bind( ctrl ),
          ctrl.ngAfterViewChecked && ctrl.ngAfterViewChecked.bind( ctrl ),
        ] );
        ctrl._ngOnChildrenChanged( ChildrenChangeHook.FromContent, [
          parentCheckedNotifiers.forEach( cb=>cb() ),
          ctrl.ngAfterContentInit && ctrl.ngAfterContentInit.bind( ctrl ),
          ctrl.ngAfterContentChecked && ctrl.ngAfterContentChecked.bind( ctrl ),
        ] );

      } else {

        // no @ContentChild/@ViewChild(ref) decorators exist, call just controller init method
        parentCheckedNotifiers.forEach( cb=>cb() );
        ctrl.ngAfterViewInit && ctrl.ngAfterViewInit();
        ctrl.ngAfterContentInit && ctrl.ngAfterContentInit();

      }

      _setupDestroyHandler( scope, element, ctrl, lfHooks.ngOnDestroy, _watchers );
    }

  }

}

export const directiveProvider = new DirectiveProvider( new DirectiveResolver() );
