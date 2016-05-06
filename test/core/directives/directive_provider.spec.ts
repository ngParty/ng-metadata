import * as sinon from 'sinon';
import { expect } from 'chai';
import { noop, isFunction } from '../../../src/facade/lang';
import {
  AfterContentInit,
  OnDestroy,
  OnInit,
  AfterViewInit
} from '../../../src/core/linker/directive_lifecycle_interfaces';
import {
  Component,
  Directive,
  Input,
  Attr,
  Output,
  HostListener,
  HostBinding
} from '../../../src/core/directives/decorators';
import { Inject, Host } from '../../../src/core/di/decorators';
import { $Scope, $Attrs, ElementFactory, $Document } from '../../utils';
import {
  directiveProvider,
  _setHostBindings,
  _getHostListenerCbParams,
  _setHostListeners,
  NgmDirective
} from '../../../src/core/directives/directive_provider';
import { NgModel } from '../../../src/common/directives/ng_model';

describe( `directives/directive_provider`, ()=> {

  it( `should create angular 1 directive factory and create directive name`, ()=> {

    @Directive( {
      selector: '[myClicker]',
      host: {
        tabindex: '1',
        role: 'button'
      }
    } )
    class MyClicker implements OnDestroy,AfterContentInit,OnInit {

      static test = {
        destroy: false,
        init: false,
        contentInit: false
      };

      @Input()
      enableColor: boolean;
      @Attr()
      defaultColor: string;
      @Output()
      execMe: Function;

      @HostBinding( 'class.is-disabled' )
      isDisabled: boolean;

      @HostListener( 'click', [ '$event' ] )
      onClick() {
        this.$attrs.$addClass( 'clicked' );
        this.execMe();
      }

      constructor( @Inject( '$attrs' ) private $attrs: ng.IAttributes ) {}

      ngOnInit() { MyClicker.test.init = true }

      ngAfterContentInit() { MyClicker.test.init = true }

      ngOnDestroy() { MyClicker.test.destroy = true }

    }

    const [directiveName,directiveFactory] = directiveProvider.createFromType( MyClicker );
    const ddo: NgmDirective = directiveFactory();

    expect( directiveName ).to.equal( 'myClicker' );
    expect( isFunction( directiveFactory ) ).to.equal( true );

    expect( directiveFactory() ).to.deep.equal( {
      require: [ 'myClicker' ],
      controller: ddo.controller,
      link: (ddo.link as ng.IDirectivePrePost),
      _ngOnInitBound: ddo._ngOnInitBound
    } );

    const howShouldLinkFnLookLike = function postLink( scope, element, attrs: ng.IAttributes, controller ) {

      const _watchers = [];
      const _observers = [];

      const [ctrl] = controller;

      // setup Inputs
      _watchers.push(
        scope.$watch( (attrs as any).enableColor, ( newValue )=> {
          ctrl.isDisabled = newValue;
        } )
      );
      // setup Attrs
      _observers.push(
        attrs.$observe( 'defaultColor', ( value )=> {
          ctrl.defaultColor = value;
        } )
      );
      // setup Outputs
      ctrl.execMe = ()=> { scope.$eval( (attrs as any).execMe ) };

      // setup host attributes
      attrs.$set( 'tabindex', '1' );
      attrs.$set( 'role', 'button' );

      // setup @HostBindings
      _watchers.push(
        scope.$watch( ()=>ctrl.isDisabled, ( newValue )=> {
          if ( newValue ) {
            attrs.$addClass( 'isDisabled' )
          } else {
            attrs.$removeClass( 'isDisabled' )
          }
        } )
      );

      // setup @HostListeners
      element
        .on( 'click', function ( $event ) {

          const noPreventDefault = Boolean( ctrl.onClick() );
          if ( noPreventDefault ) {
            $event.preventDefault();
          }

        } );

      // AfterContent Hooks
      ctrl.ngAfterContentInit();

      // destroy
      scope.$on( '$destroy', ()=> {

        ctrl.ngOnDestroy();

        _watchers.forEach( _watcherDispose=>_watcherDispose() );
        _observers.forEach( _observerDispose=>_observerDispose() );
        element.off();

      } );

    };

  } );

  it( `should correctly create angular 1 directive component and it's name`, ()=> {

    @Component( {
      selector: 'jedi-master',
      host: {
        tabindex: '1'
      },
      template: `<div>Click me to attack!</div>`
    } )
    class JediMasterCmp implements OnDestroy,AfterViewInit,OnInit {

      static test = {
        destroy: false,
        init: false,
        contentInit: false
      };

      @Input()
      enableColor: boolean;
      @Attr()
      defaultColor: string;
      @Output()
      onLightsaberAttack: Function;

      @HostBinding( 'class.is-disabled' )
      isDisabled: boolean;

      @HostListener( 'click', [ '$event' ] )
      onClick() {
        this.$attrs.$addClass( 'clicked' );
        this.onLightsaberAttack();
      }

      constructor( @Inject( '$attrs' ) private $attrs: ng.IAttributes ) {}

      ngOnInit() { JediMasterCmp.test.init = true }

      ngAfterViewInit() { JediMasterCmp.test.init = true }

      ngOnDestroy() { JediMasterCmp.test.destroy = true }

    }

    const [directiveName,directiveFactory] = directiveProvider.createFromType( JediMasterCmp );
    const ddo: NgmDirective = directiveFactory();
    expect( directiveName ).to.equal( 'jediMaster' );

    expect( isFunction( directiveFactory ) ).to.equal( true );

    expect( ddo ).to.deep.equal( {
      scope: {},
      bindToController: {
        // enableColor: '=',
        // defaultColor: '@',
        // onLightsaberAttack: '&'
      },
      require: [ 'jediMaster' ],
      controller: ddo.controller,
      controllerAs: '$ctrl',
      link: (ddo.link as ng.IDirectivePrePost),
      template: `<div>Click me to attack!</div>`,
      transclude: false,
      _ngOnInitBound: ddo._ngOnInitBound
    } );

    const howShoulsLinkLookLike = {
      pre: function ( scope, element, attrs, controller ) {
        const [ctrl] = controller;
        ctrl.ngOnInit();
      },
      post: function ( scope, element, attrs: ng.IAttributes, controller ) {

        const _watchers = [];

        const [ctrl] = controller;

        // setup host attributes
        attrs.$set( 'tabindex', '1' );

        // setup @HostBindings
        _watchers.push(
          scope.$watch( ()=>ctrl.isDisabled, ( newValue )=> {
            if ( newValue ) {
              attrs.$addClass( 'isDisabled' )
            } else {
              attrs.$removeClass( 'isDisabled' )
            }
          } )
        );

        // setup @HostListeners
        element
          .on( 'click', function ( $event ) {

            const noPreventDefault = Boolean( ctrl.onClick() );
            if ( noPreventDefault ) {
              $event.preventDefault();
            }

          } );

        // AfterContent Hooks
        ctrl.ngAfterViewInit();

        // destroy
        scope.$on( '$destroy', ()=> {

          ctrl.ngOnDestroy();

          _watchers.forEach( _watcherDispose=>_watcherDispose() );
          element.off();

        } );

      }
    };


  } );

  describe( `local directive injections`, ()=> {

    it( `should correctly inject and bind directive to instance by string`, ()=> {

      @Directive({selector:'[validator]'})
      class MyValidator{
        constructor(
          @Inject('$log') $log: ng.ILogService,
          @Host() private ngModel: NgModel
        ){}
      }

      const [directiveName,directiveFactory] = directiveProvider.createFromType( MyValidator );
      const ddo: NgmDirective = directiveFactory();

      expect( directiveName ).to.equal( 'validator' );
      expect( isFunction( directiveFactory ) ).to.equal( true );
      expect( directiveFactory() ).to.deep.equal( {
        require: [ 'validator','^ngModel' ],
        controller: ddo.controller,
        link: ddo.link as ng.IDirectiveLinkFn,
        _ngOnInitBound: ddo._ngOnInitBound
      } );

    } );

    it( `should correctly inject and bind directive to instance by Injectable `, ()=> {

      @Directive({selector:'[my-css-mutator]'})
      class CssHandler{}

      @Directive({selector:'[my-css-extractor]'})
      class CssExtractorHandler{}

      @Directive({selector:'[validator]'})
      class MyValidator{
        constructor(
          @Inject('$log') $log: ng.ILogService,
          @Inject('ngModel') @Host() private ngModel,
          @Inject(CssHandler) @Host() private myCssMutator,
          @Host() private myCssExtractor: CssExtractorHandler
        ){}
      }

      const [directiveName,directiveFactory] = directiveProvider.createFromType( MyValidator );
      const ddo: NgmDirective = directiveFactory();

      expect( directiveName ).to.equal( 'validator' );
      expect( isFunction( directiveFactory ) ).to.equal( true );
      expect( directiveFactory() ).to.deep.equal( {
        require: [ 'validator','^ngModel','^myCssMutator','^myCssExtractor' ],
        controller: ddo.controller,
        link: ddo.link as ng.IDirectiveLinkFn,
        _ngOnInitBound: ddo._ngOnInitBound
      } );

    } );

  } );

  describe( `static DDO methods on class`, ()=> {

    describe( `compile function`, ()=> {

      it( `should allow to define compile ddo function as static method`, ()=> {

        const spyFromCompile = sinon.spy();

        @Directive({selector:'[with-compile]'})
        class WithCompileDirective{
          static compile(tElement:ng.IAugmentedJQuery,tAttrs:ng.IAttributes){
            spyFromCompile();
          }
        }

        const [,directiveFactory] = directiveProvider.createFromType( WithCompileDirective );
        const ddo: NgmDirective = directiveFactory();

        expect( isFunction(ddo.compile) ).to.equal(true);

        expect( ddo ).to.deep.equal( {
          require: [ 'withCompile' ],
          controller: ddo.controller,
          compile: ddo.compile,
          link: ddo.link as ng.IDirectiveLinkFn,
          _ngOnInitBound: ddo._ngOnInitBound
        } );

        expect( spyFromCompile.called ).to.equal( false );

        const linkFromCompileFn = ddo.compile({} as ng.IAugmentedJQuery,{} as ng.IAttributes, noop as ng.ITranscludeFunction)
        expect( linkFromCompileFn ).to.equal( ddo.link );
        expect( spyFromCompile.called ).to.equal( true );

      } );

      it( `should return the link fn from compile if it returns function`, ()=> {

        const spyFromCompile = sinon.spy();
        const spyFromLink = sinon.spy();

        @Directive( { selector: '[with-compile]' } )
        class WithCompileDirective {
          static compile( tElement: ng.IAugmentedJQuery, tAttrs: ng.IAttributes ) {
            spyFromCompile();
            return function postLink( scope, element, attrs, controller, transclude ) {
              spyFromLink();
            }
          }
        }

        const [,directiveFactory] = directiveProvider.createFromType( WithCompileDirective );
        const ddo: ng.IDirective = directiveFactory();
        const ddoLinkSpy = sinon.spy( ddo.link, 'post' );

        expect( spyFromCompile.called ).to.equal( false );
        expect( ddoLinkSpy.called ).to.equal( false );

        const linkFromCompileFn = ddo.compile( {} as ng.IAugmentedJQuery,
          {} as ng.IAttributes,
          noop as ng.ITranscludeFunction ) as Function;

        expect( spyFromCompile.called ).to.equal( true );
        expect( linkFromCompileFn ).to.not.equal( ddo.link );

        linkFromCompileFn( {}, {}, {}, noop, noop );
        expect( spyFromLink.called ).to.equal( true );

      } );

    } );

    describe( `link function`, ()=> {

      it( `should allow to define link ddo function as static method`, ()=> {

        const spyFromLink = sinon.spy();

        @Directive({selector:'[with-compile]'})
        class WithLink{
          static link(scope,el,attrs,ctrl,translcude){
            spyFromLink();
          }
        }

        const [,directiveFactory] = directiveProvider.createFromType( WithLink );
        const ddo: NgmDirective = directiveFactory();

        expect( isFunction( ddo.link ) ).to.equal( true );
        expect( ddo.link ).to.equal( WithLink.link );

        expect( ddo ).to.deep.equal( {
          require: [ 'withCompile' ],
          controller: ddo.controller,
          link: WithLink.link as ng.IDirectiveLinkFn,
          _ngOnInitBound: ddo._ngOnInitBound
        } );

        expect( spyFromLink.called ).to.equal( false );

        (ddo.link as ng.IDirectiveLinkFn)(
          {} as ng.IScope,
          {} as ng.IAugmentedJQuery,
          {} as ng.IAttributes,
          noop,
          noop as ng.ITranscludeFunction
        );

        expect( spyFromLink.called ).to.equal( true );

      } );

    } );


  } );

  describe( `life cycles`, ()=> {

    let $element;
    let $scope;
    let $attrs;
    let $transclude;
    beforeEach( ()=> {

      $element = ElementFactory();
      $scope = new $Scope();
      $attrs = new $Attrs();
      $transclude = noop();

    } );
    it( `should call ngOnDestroy only if it's implemented from postLink`, ()=> {

      @Directive({selector:'[myDir]'})
      class MyDirective{
        ngOnDestroy(){}
      }

      const ctrl = [ new MyDirective() ];
      const spy = sinon.spy( ctrl[0],'ngOnDestroy' );

      const directiveProviderArr = directiveProvider.createFromType( MyDirective );
      const ddo = directiveProviderArr[ 1 ]();
      const link = (ddo.link as ng.IDirectivePrePost).post as ng.IDirectiveLinkFn;

      expect( isFunction( link ) ).to.equal( true );
      expect( spy.called ).to.equal( false );

      link( $scope, $element, $attrs, ctrl, $transclude );
      expect( spy.called ).to.equal( false );

      $scope.$emit( '$destroy' );
      expect( spy.called ).to.equal( true );


      spy.restore();

    } );

    it( `should call ngAfterContentInit only if it's implemented from postLink`, ()=> {

      @Directive({selector:'[myDir]'})
      class MyDirective implements AfterContentInit{
        ngAfterContentInit(){}
      }

      const ctrl = [ new MyDirective() ];
      const spy = sinon.spy( ctrl[0],'ngAfterContentInit' );

      const directiveProviderArr = directiveProvider.createFromType( MyDirective );
      const ddo = directiveProviderArr[ 1 ]();
      const link = (ddo.link as ng.IDirectivePrePost).post as ng.IDirectiveLinkFn;

      expect( isFunction( link ) ).to.equal( true );
      expect( spy.called ).to.equal( false );

      link( $scope, $element, $attrs, ctrl, $transclude );
      expect( spy.called ).to.equal( true );

      spy.restore();

    } );

    it( `should call ngAfterViewInit from @Component only if it's implemented from postLink`, ()=> {

      @Component({selector:'my-cmp'})
      class MyComponent implements AfterViewInit{
        ngAfterViewInit() {}
      }

      const ctrl = [ new MyComponent() ];
      const spy = sinon.spy( ctrl[0],'ngAfterViewInit' );

      const directiveProviderArr = directiveProvider.createFromType( MyComponent );
      const ddo = directiveProviderArr[ 1 ]();
      const link = (ddo.link as ng.IDirectivePrePost).post as ng.IDirectiveLinkFn;

      expect( isFunction( link ) ).to.equal( true );
      expect( spy.called ).to.equal( false );

      link( $scope, $element, $attrs, ctrl, $transclude );
      expect( spy.called ).to.equal( true );

      spy.restore();

    } );

    it( `should call all hooks if they are implemented from postLink expect ngOnInit which is called form preLink`, ()=> {

      @Directive({selector:'[myDir]'})
      class MyDirective{
        constructor(){}
        ngOnInit(){}
        ngAfterContentInit(){}
        ngOnDestroy(){}
      }

      const ctrl = [ new MyDirective() ];
      // mock _ngOnInitBound
      const _ngOnInitBound = function () {ctrl[ 0 ].ngOnInit()};
      const spyInit = sinon.spy( ctrl[0],'ngOnInit' );
      const spyAfterContentInit = sinon.spy( ctrl[0],'ngAfterContentInit' );
      const spyDestroy = sinon.spy( ctrl[0],'ngOnDestroy' );

      const directiveProviderArr = directiveProvider.createFromType( MyDirective );
      const ddo = directiveProviderArr[ 1 ]();
      sinon.stub( ddo.link, 'pre', ()=>_ngOnInitBound() );

      const { pre:preLink, post:postLink } = ddo.link as ng.IDirectivePrePost;

      expect( isFunction( preLink ) ).to.equal( true );
      expect( isFunction( postLink ) ).to.equal( true );

      expect( spyInit.called ).to.equal( false );
      expect( spyAfterContentInit.called ).to.equal( false );
      expect( spyDestroy.called ).to.equal( false );


      preLink( $scope, $element, $attrs, ctrl, $transclude );

      expect( spyInit.called ).to.equal( true );


      postLink( $scope, $element, $attrs, ctrl, $transclude );

      expect( spyAfterContentInit.called ).to.equal( true );
      expect( spyDestroy.called ).to.equal( false );


      $scope.$emit( '$destroy' );

      expect( spyAfterContentInit.called ).to.equal( true );
      expect( spyDestroy.called ).to.equal( true );

      spyInit.restore();
      spyAfterContentInit.restore();
      spyDestroy.restore();
      (ddo.link as any).pre.restore();

    } );

    describe( `error handling`, ()=> {

      it( `should throw if @Component implements both AfterViewInit and AfterContentInit`, ()=> {

        @Component({selector:'my-cmp'})
        class MyComponent implements AfterViewInit,AfterContentInit{
          ngAfterContentInit() {}
          ngAfterViewInit() {}
        }

        expect( ()=>directiveProvider.createFromType( MyComponent ) ).to.throw();

      } );

      it( `should throw if @Directive implements AfterViewInit because it doesn't have any View`, ()=> {

        @Directive( { selector: '[myDir]' } )
        class MyDirective implements AfterViewInit {
          ngAfterViewInit() {}
        }

        expect( ()=>directiveProvider.createFromType( MyDirective ) ).to.throw();

      } );

    } );

  } );

  describe( `private API`, ()=> {

    describe( `#_createComponentBindings`, ()=> {

      it( `should create bindings from inputs,attrs,outputs`, ()=> {

        const inputs = [
          'one', 'two: twoAlias',
          'oneOpt: ?oneOpt',
          'oneWay: <', 'oneWayAlias: <oneWayAlas'
        ];
        const attrs = [ 'color', 'brood: broodAlias' ];
        const outputs = [ 'onFoo', 'onMoo: onMooAlias' ];

        const actual = directiveProvider._createComponentBindings( inputs, attrs, outputs );
        const expected = {
          one: '=?',
          oneOpt: '=?oneOpt',
          two: '=?twoAlias',
          color: '@?',
          brood: '@?broodAlias',
          onFoo: '&?',
          onMoo: '&?onMooAlias',
          oneWay: '<?',
          oneWayAlias: '<?oneWayAlas'
        };

        expect( actual ).to.deep.equal( expected );

      } );

    } );

    describe( `#_createRequires`, ()=> {

      it( `should return require array from require map`, ()=> {

        const requireMap = {
          clicker: '^clicker',
          api: '?^api',
          ngModel: 'ngModel'
        } as {[key:string]:string};
        const directiveName = 'own';

        const actual = directiveProvider._createRequires( requireMap, directiveName );
        const expected = [ 'own', '^clicker', '?^api', 'ngModel' ];

        expect( actual ).to.deep.equal( expected );

      } );

    } );

    describe( `#_processHost`, ()=> {

      it( `should parse host object and return separated map`, ()=> {

        const host = {
          'tabindex': '1',
          'role': 'button',
          '[class.disabled]': 'isDisabled',
          '[class.enabled]': 'isEnabled',
          '[attr.aria-label]': 'ariaLabel',
          '[readonly]': 'isReadonly',
          '(mousemove)': 'onMove($event.target)',
          '(mouseenter)': 'onMouseEnter($event.clientX,$event.clientY)',
          '(mouseleave)': 'onMouseLeave($event.clientX, $event.clientY)',
          '(mouseout)': 'onMoveOut()',
          '(document: click)': 'onDocumentClick()',
          '(window    : resize)': 'onWindowResize()',
          '(body:keydown)': 'onKeyDown()'
        } as any;
        const actual = directiveProvider._processHost( host );
        const expected = {
          hostStatic: {
            'tabindex': '1',
            'role': 'button'
          },
          hostBindings: {
            classes: {
              'disabled': 'isDisabled',
              'enabled': 'isEnabled'
            },
            attributes: {
              'aria-label': 'ariaLabel'
            },
            properties: {
              'readonly': 'isReadonly'
            }
          },
          hostListeners: {
            'mousemove': [ 'onMove', '$event.target' ],
            'mouseenter': [ 'onMouseEnter', '$event.clientX', '$event.clientY' ],
            'mouseleave': [ 'onMouseLeave', '$event.clientX', '$event.clientY' ],
            'mouseout': [ 'onMoveOut' ],
            'document:click': [ 'onDocumentClick' ],
            'window:resize': [ 'onWindowResize' ],
            'body:keydown': [ 'onKeyDown' ]
          }
        };

        expect( actual ).to.deep.equal( expected );

      } );

    } );

    describe( `#_createDDO`, ()=> {

      it( `should create DDO from shell and provided ddo`, ()=> {

        const actual = directiveProvider._createDDO( {
          scope: {},
          bindToController: { item: '=' },
          require: [ 'foo' ],
          controller: class Foo {},
          controllerAs: 'ctrl',
          template: 'hello'
        }, {} );
        const expected = {
          scope: {},
          bindToController: { item: '=' },
          require: [ 'foo' ],
          controller: actual.controller,
          controllerAs: 'ctrl',
          template: 'hello',
          link: actual.link
        };

        expect( actual ).to.deep.equal( expected );

      } );

      it( `should overwrite any property with legacy DDO`, ()=> {

        const actual = directiveProvider._createDDO( {
          scope: {},
          bindToController: { item: '=' },
          require: [ 'foo' ],
          controller: class Foo {},
          controllerAs: 'ctrl',
          template: 'hello'
        }, {
          scope: true,
          controllerAs: 'foo',
          transclude: false
        } );

        const expected = {
          scope: true,
          bindToController: { item: '=' },
          require: [ 'foo' ],
          controller: actual.controller,
          controllerAs: 'foo',
          template: 'hello',
          link: actual.link,
          transclude: false
        };

        expect( actual ).to.deep.equal( expected );

      } );

    } );

    describe( `link fn creators helpers`, ()=> {

      describe( `#_setHostBindings`, ()=> {

        let $scope;
        let $element;
        let hostBindings = {
          classes: { 'is-foo': 'isFoo' } as StringMap,
          attributes: { 'aria-label': 'aria' } as StringMap,
          properties: { 'style.fontSize': 'fontSize' } as StringMap
        };
        let ctrl = { isFoo: true, aria: 'hello', fontSize: 12 };

        beforeEach( ()=> {
          $scope = new $Scope();
          $element = ElementFactory();
        } );

        it( `should create array of scope.$watch disposable callbacks`, ()=> {

          const actual = _setHostBindings( $scope, $element, ctrl, hostBindings );

          expect( actual.length ).to.deep.equal( 3 );
          expect( actual.every( isFunction ) ).to.deep.equal( true );
          expect( $scope.$$watchers.length ).to.equal( 3 );

        } );

        it( `should toggle host bindings appropriately for class bindings`, ()=> {

          const actual = _setHostBindings( $scope, $element, ctrl, hostBindings );

          const classWatcher = $scope.$$watchers[ 0 ];
          const [watchExp,watchListener] = classWatcher;

          expect( watchExp() ).to.equal( true );

          watchListener( true );
          expect( $element.classList[ 'is-foo' ] ).to.equal( true );

          watchListener( false );
          expect( $element.classList[ 'is-foo' ] ).to.equal( undefined );

        } );

        it( `should toggle host bindings appropriately for attr bindings`, ()=> {

          const actual = _setHostBindings( $scope, $element, ctrl, hostBindings );

          const attrWatcher = $scope.$$watchers[ 1 ];
          const [watchExp,watchListener] = attrWatcher;

          expect( watchExp() ).to.equal( 'hello' );

          watchListener( 'nope' );
          expect( $element.attributes[ 'aria-label' ] ).to.equal( 'nope' );

          watchListener( 'yay' );
          expect( $element.attributes[ 'aria-label' ] ).to.equal( 'yay' );

        } );

        it( `should toggle host bindings appropriately for prop bindings`, ()=> {

          const actual = _setHostBindings( $scope, $element, ctrl, hostBindings );

          const propWatcher = $scope.$$watchers[ 2 ];
          const [watchExp,watchListener] = propWatcher;

          expect( watchExp() ).to.equal( 12 );

          watchListener( '12px' );
          expect( $element[ 0 ][ 'style' ][ 'fontSize' ] ).to.equal( '12px' );

          watchListener( '2rem' );
          expect( $element[ 0 ][ 'style' ][ 'fontSize' ] ).to.equal( '2rem' );

        } );

      } );

      describe( `#_setHostListeners`, () => {

        const sandbox = sinon.sandbox.create();
        let $element;
        let $scope;
        let hostListeners = {
          'click': [ 'onClick', '$event' ],
          'mousemove': [ 'onMove', '$event.target.x', '$event.target.x' ],
          'mouseout': [ 'onOut' ],
          'document: click': [ 'onDocumentClick' ]
        } as {[key:string]:string[]};
        let ctrl = {
          onClick: sandbox.spy( ( evt )=> {} ),
          onMove: sandbox.spy( ( x, y )=> {} ),
          onOut: sandbox.spy( ()=>true ),
          onDocumentClick: sandbox.spy( ( evt ) => ({}) )
        };
        let event = {
          target: {
            position: 123,
            x: 111,
            y: 3333
          },
          preventDefault: sandbox.spy()
        };

        beforeEach( ()=> {
          $element = ElementFactory();
          $scope = new $Scope();
          _setHostListeners( $scope, $element, ctrl, hostListeners );
        } );

        afterEach( ()=> {
          event.preventDefault.reset();
          sandbox.restore();
        } );

        it( `should register proper host listeners`, ()=> {

          const allAreFunctions = $element._eventListeners.every( evListener=> {
            return isFunction( evListener.cb );
          } );

          expect( $element._eventListeners.length ).to.equal( 3 );
          expect( allAreFunctions ).to.equal( true );

        } );

        it( `should register proper global host listeners`, () => {

          const $document = $element.injector().get( '$document' );

          expect( isFunction( $document._eventListeners[ 0 ].cb ) ).to.equal( true );

        } );

        it( `should call proper controller method on element event trigger`, ()=> {

          const [{cb:clickCb},{cb:moveCb},{cb:outCb}] = $element._eventListeners;

          expect( ctrl.onClick.called ).to.equal( false );
          clickCb( event );
          expect( ctrl.onClick.called ).to.equal( true );

          expect( ctrl.onMove.called ).to.equal( false );
          moveCb( event );
          expect( ctrl.onMove.called ).to.equal( true );

          expect( ctrl.onOut.called ).to.equal( false );
          outCb( event );
          expect( ctrl.onOut.called ).to.equal( true );

        } );

        it( `should call event.preventDefault if ctrl method call returns falsy value`, ()=> {

          const [{cb:clickCb}] = $element._eventListeners;

          expect( event.preventDefault.called ).to.equal( false );

          clickCb( event );

          expect( event.preventDefault.called ).to.equal( true );

        } );

        it( `should not call event.preventDefault if ctrl method call returns truthy value`, ()=> {

          const [,,{cb:outCb}] = $element._eventListeners;

          expect( event.preventDefault.called ).to.equal( false );

          outCb( event );

          expect( event.preventDefault.called ).to.equal( false );

        } );

      } );

      describe( `#_getHostListenerCbParams`, ()=> {

        it( `should throw if event name doesn't have $event prefix`, ()=> {

          const event = {};
          const eventParams = [ 'target' ];

          expect( ()=>_getHostListenerCbParams( event, eventParams ) ).to.throw();

        } );

        it( `should return all event values from eventParams path if they exist on $event`, ()=> {

          const event = {
            target: {
              position: 123,
              x: 111,
              y: 3333
            }
          };
          const eventParams = [
            '$event', '$event.target', '$event.target.position', '$event.position'
          ];
          const actual = _getHostListenerCbParams( event, eventParams );
          const expected = [
            event,
            { position: 123, x: 111, y: 3333 },
            123,
            undefined
          ];

          expect( actual ).to.deep.equal( expected );

        } );

      } );

    } );

  } );

} );
