import * as sinon from 'sinon';
import {expect} from 'chai';

import {noop,isFunction} from '../../../src/facade/lang';
import {AfterContentInit,OnDestroy,OnInit} from '../../../src/core/linker/directive_lifecycle_interfaces';
import {Component,Directive,Input,Attr,Output,HostListener,HostBinding} from '../../../src/core/directives/decorators';
import {Inject} from '../../../src/core/di/decorators';
import {DirectiveMetadata} from '../../../src/core/directives/metadata_directives';
import {$Scope,$Attrs,ElementFactory} from '../../../src/testing/utils';

import {
  directiveProvider,
  DirectiveProvider,
  _setHostBindings,
  _assignRequiredCtrlInstancesToHostCtrl,
  _getHostListenerCbParams,
  _setHostListeners,
  _createDirectiveBindings
} from '../../../src/core/directives/directive_provider';

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
    const ddo: ng.IDirective = directiveFactory();

    //console.log( ddo.link.pre.toString() );
    //console.log( ddo.link.post.toString() );

    expect( directiveName ).to.equal( 'myClicker' );
    expect( isFunction( directiveFactory ) ).to.equal( true );
    expect( directiveFactory() ).to.deep.equal( {
      require: [ 'myClicker' ],
      controller: MyClicker,
      link: {
        pre: (ddo.link as ng.IDirectivePrePost).pre,
        post: (ddo.link as ng.IDirectivePrePost).post
      },
    } );

    const howShouldLinkFnLookLike = {
      pre: function ( scope, element, attrs, controller ) {
        const [ctrl] = controller;
        ctrl.ngOnInit();
      },
      post: function ( scope, element, attrs: ng.IAttributes, controller ) {

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

      }
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
    class JediMasterCmp implements OnDestroy,AfterContentInit,OnInit {

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

      ngAfterContentInit() { JediMasterCmp.test.init = true }

      ngOnDestroy() { JediMasterCmp.test.destroy = true }

    }

    const [directiveName,directiveFactory] = directiveProvider.createFromType( JediMasterCmp );
    const ddo: ng.IDirective = directiveFactory();
    expect( directiveName ).to.equal( 'jediMaster' );

    expect( isFunction( directiveFactory ) ).to.equal( true );

    expect( ddo ).to.deep.equal( {
      scope: {},
      bindToController: {
        enableColor: '=',
        defaultColor: '@',
        onLightsaberAttack: '&'
      },
      require: [ 'jediMaster' ],
      controller: JediMasterCmp,
      controllerAs: 'ctrl',
      link: {
        pre: (ddo.link as ng.IDirectivePrePost).pre,
        post: (ddo.link as ng.IDirectivePrePost).post
      },
      template: `<div>Click me to attack!</div>`,
      transclude: true
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
        ctrl.ngAfterContentInit();

        // destroy
        scope.$on( '$destroy', ()=> {

          ctrl.ngOnDestroy();

          _watchers.forEach( _watcherDispose=>_watcherDispose() );
          element.off();

        } );

      }
    };


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
    it( `should call ngOnInit only if it's implemented from preLink`, ()=> {

      @Directive({selector:'[myDir]'})
      class MyDirective{
        ngOnInit(){}
      }

      const ctrl = [ new MyDirective() ];
      const spy = sinon.spy( ctrl[0],'ngOnInit' );

      const directiveProviderArr = directiveProvider.createFromType( MyDirective );
      const ddo = directiveProviderArr[ 1 ]();
      const link: ng.IDirectivePrePost = ddo.link;

      expect( isFunction( link.pre ) ).to.equal( true );
      expect( isFunction( link.post ) ).to.equal( true );
      expect( spy.called ).to.equal( false );

      link.pre( $scope, $element, $attrs, ctrl, $transclude );
      expect( spy.called ).to.equal( true );

      spy.restore();

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
      const link = ddo.link as ng.IDirectiveLinkFn;

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
      const link = ddo.link as ng.IDirectiveLinkFn;

      expect( isFunction( link ) ).to.equal( true );
      expect( spy.called ).to.equal( false );

      link( $scope, $element, $attrs, ctrl, $transclude );
      expect( spy.called ).to.equal( true );

      spy.restore();

    } );

    it( `should call all hooks if they are implemented`, ()=> {

      @Directive({selector:'[myDir]'})
      class MyDirective{
        ngOnInit(){}
        ngAfterContentInit(){}
        ngOnDestroy(){}
      }

      const ctrl = [ new MyDirective() ];
      const spyInit = sinon.spy( ctrl[0],'ngOnInit' );
      const spyAfterContentInit = sinon.spy( ctrl[0],'ngAfterContentInit' );
      const spyDestroy = sinon.spy( ctrl[0],'ngOnDestroy' );

      const directiveProviderArr = directiveProvider.createFromType( MyDirective );
      const ddo = directiveProviderArr[ 1 ]();
      const link: ng.IDirectivePrePost = ddo.link;

      expect( isFunction( link.pre ) ).to.equal( true );
      expect( isFunction( link.post ) ).to.equal( true );

      expect( spyInit.called ).to.equal( false );
      expect( spyAfterContentInit.called ).to.equal( false );
      expect( spyDestroy.called ).to.equal( false );

      link.pre( $scope, $element, $attrs, ctrl, $transclude );
      expect( spyInit.called ).to.equal( true );
      expect( spyAfterContentInit.called ).to.equal( false );
      expect( spyDestroy.called ).to.equal( false );

      link.post( $scope, $element, $attrs, ctrl, $transclude );

      expect( spyInit.called ).to.equal( true );
      expect( spyAfterContentInit.called ).to.equal( true );
      expect( spyDestroy.called ).to.equal( false );

      $scope.$emit( '$destroy' );

      expect( spyInit.called ).to.equal( true );
      expect( spyAfterContentInit.called ).to.equal( true );
      expect( spyDestroy.called ).to.equal( true );

      spyInit.restore();
      spyAfterContentInit.restore();
      spyDestroy.restore();

    } );

  } );

  describe( `private API`, ()=> {

    describe( `#_createComponentBindings`, ()=> {

      it( `should create bindings from inputs,attrs,outputs`, ()=> {

        const inputs = [ 'one', 'two: twoAlias' ];
        const attrs = [ 'color', 'brood: broodAlias' ];
        const outputs = [ 'onFoo', 'onMoo: onMooAlias' ];

        const actual = directiveProvider._createComponentBindings( inputs, attrs, outputs );
        const expected = {
          one: '=',
          two: '=twoAlias',
          color: '@',
          brood: '@broodAlias',
          onFoo: '&',
          onMoo: '&onMooAlias'
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
          '(mouseout)': 'onMoveOut()'
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
            'mouseout': [ 'onMoveOut' ]
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

      describe( `#_assignRequiredCtrlInstancesToHostCtrl`, ()=> {

        it( `should extend ctrl instances with requiredCtrl names with proper require ctrl instances`, ()=> {

          const ngModel = { $modelValue: undefined, $viewValue: '123', $setViewValue: noop };
          const emSomeDirective = { callMe: noop };
          const requiredCtrlVarNames = [ 'ngModelCtrl', 'someDirective' ];
          const requiredCtrls = [ ngModel, emSomeDirective ];
          const ctrl = {};

          _assignRequiredCtrlInstancesToHostCtrl( requiredCtrlVarNames, requiredCtrls, ctrl );
          const expected = {
            ngModelCtrl: ngModel,
            someDirective: emSomeDirective
          };

          expect( ctrl ).to.deep.equal( expected );

        } );

      } );

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

      describe( `#_setHostListeners`, ()=> {

        const sandbox = sinon.sandbox.create();
        let $element;
        let $scope;
        let hostListeners = {
          'click': [ 'onClick', '$event' ],
          'mousemove': [ 'onMove', '$event.target.x', '$event.target.x' ],
          'mouseout': [ 'onOut' ]
        } as {[key:string]:string[]};
        let ctrl = {
          onClick: sandbox.spy( ( evt )=> {} ),
          onMove: sandbox.spy( ( x, y )=> {} ),
          onOut: sandbox.spy( ()=>true )
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

      describe( `#_createDirectiveBindings`, ()=> {

        const sandbox = sinon.sandbox.create();
        let $element;
        let $scope;
        let $attrs;
        let ctrl;
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
          $attrs = new $Attrs();
          ctrl = {};
        } );

        afterEach( ()=> {

          event.preventDefault.reset();
          sandbox.restore();

        } );

        it( `should create array of scope.$watch disposable callbacks for @Input`, ()=> {

          const metadata = {
            inputs: [
              'foo',
              'one: oneAlias'
            ]
          } as DirectiveMetadata;
          const bindingDisposables = _createDirectiveBindings( $scope, $attrs, ctrl, metadata );
          const {watchers,observers} = bindingDisposables;

          expect( watchers.length ).to.equal( 2 );
          expect( observers.length ).to.equal( 0 );

          const [[firstExp,firstList],[secondExp,secondList]] = $scope.$$watchers;

          expect(firstExp).to.equal(undefined);
          expect( ctrl.foo ).to.equal( undefined );
          firstList( 'hello' );
          expect( ctrl.foo ).to.equal( 'hello' );

          expect(secondExp).to.equal(undefined);
          expect( ctrl.one ).to.equal( undefined );
          secondList( 'hello one' );
          expect( ctrl.one ).to.equal( 'hello one' );

        } );

        it( `should create array of attrs.$observe disposable callbacks for @Attr`, ()=> {

          const metadata = {
            attrs: [
              'foo',
              'one: oneAlias'
            ]
          } as DirectiveMetadata;
          const bindingDisposables = _createDirectiveBindings( $scope, $attrs, ctrl, metadata );
          const {watchers,observers} = bindingDisposables;

          expect( watchers.length ).to.equal( 0 );
          expect( observers.length ).to.equal( 2 );

          const [[firstExp,firstList],[secondExp,secondList]] = $attrs.$$observers;

          expect(firstExp).to.equal('foo');
          expect( ctrl.foo ).to.equal( undefined );
          firstList( 'hello' );
          expect( ctrl.foo ).to.equal( 'hello' );

          expect(secondExp).to.equal('oneAlias');
          expect( ctrl.one ).to.equal( undefined );
          secondList( 'hello one' );
          expect( ctrl.one ).to.equal( 'hello one' );

        } );

        it( `should set to property function which evaluates experssion for @Output`, ()=> {

          const metadata = {
            outputs: [
              'onFoo',
              'onOne: onOneAlias'
            ]
          } as DirectiveMetadata;
          const bindingDisposables = _createDirectiveBindings( $scope, $attrs, ctrl, metadata );
          const {watchers,observers} = bindingDisposables;

          expect( watchers.length ).to.equal( 0 );
          expect( observers.length ).to.equal( 0 );
          expect( Object.keys( ctrl ) ).to.deep.equal( [ 'onFoo', 'onOne' ] );
          expect( ctrl.onFoo() ).to.equal( 'onFoo evaluated' );
          expect( ctrl.onOne() ).to.equal( 'onOneAlias evaluated' );

        } );

      } );

    } );

  } );

} );
