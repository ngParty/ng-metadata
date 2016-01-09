import {expect} from 'chai';

import {isFunction} from "../../src/facade/lang";
import {Component,Directive} from "../../src/directives/decorators";
import {AfterContentInit,OnDestroy,OnInit} from "../../src/linker/directive_lifecycle_interfaces";
import {Input,Attr,Output,HostListener,HostBinding} from "../../src/directives/decorators";
import {Inject} from "../../src/di/decorators";
import {directiveProvider,DirectiveProvider} from "../../src/directives/directive_provider";
import {noop} from "../../src/facade/lang";
import {_assignRequiredCtrlInstancesToHostCtrl} from "../../src/directives/directive_provider";
import {_setHostBindings} from "../../src/directives/directive_provider";

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
      controller: MyClicker.constructor,
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
      controller: JediMasterCmp.constructor,
      controllerAs: 'ctrl',
      link: {
        pre: (ddo.link as ng.IDirectivePrePost).pre,
        post: (ddo.link as ng.IDirectivePrePost).post
      },
      template: `<div>Click me to attack!</div>`
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
          '[attr.aria-label]':'ariaLabel',
          '[readonly]':'isReadonly',
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
            'mousemove': ['onMove','$event.target'],
            'mouseout': ['onMoveOut']
          }
        };

        expect( actual ).to.deep.equal( expected );

      } );

    } );

    describe( `#_createDDO`, ()=> {

      it( `should create DDO from shell and provided ddo`, ()=> {

        const actual = directiveProvider._createDDO({
          scope:{},
          bindToController:{item:'='},
          require:['foo'],
          controller: class Foo{},
          controllerAs: 'ctrl',
          template:'hello'
        },{});
        const expected = {
          scope:{},
          bindToController:{item:'='},
          require:['foo'],
          controller: actual.controller,
          controllerAs: 'ctrl',
          template:'hello',
          link:actual.link
        };

        expect(actual).to.deep.equal(expected);

      } );

      it( `should overwrite any property with legacy DDO`, ()=> {

        const actual = directiveProvider._createDDO({
          scope:{},
          bindToController:{item:'='},
          require:['foo'],
          controller: class Foo{},
          controllerAs: 'ctrl',
          template:'hello'
        },{
          scope: true,
          controllerAs:'foo',
          transclude: false
        });

        const expected = {
          scope:true,
          bindToController:{item:'='},
          require:['foo'],
          controller: actual.controller,
          controllerAs: 'foo',
          template:'hello',
          link:actual.link,
          transclude: false
        };

        expect(actual).to.deep.equal(expected);

      } );

    } );

    describe( `link fn creators helpers`, ()=> {

      describe( `#_assignRequiredCtrlInstancesToHostCtrl`, ()=> {

        it( `should extend ctrl instances with requiredCtrl names with proper require ctrl instances`, ()=> {

          const ngModel = { $modelValue: undefined, $viewValue:'123', $setViewValue: noop};
          const emSomeDirective = { callMe: noop };
          const requiredCtrlVarNames = [ 'ngModelCtrl', 'someDirective' ];
          const requiredCtrls = [ ngModel, emSomeDirective ];
          const ctrl = {};

          _assignRequiredCtrlInstancesToHostCtrl( requiredCtrlVarNames, requiredCtrls, ctrl );
          const expected = {
            ngModelCtrl: ngModel,
            someDirective: emSomeDirective
          };

          expect(ctrl).to.deep.equal(expected);

        } );

      } );

      describe( `#_setHostBindings`, ()=> {

        class $Scope{
          $$watchers = [];
          $watch(watchExp: Function|string,watchListener:Function){
            this.$$watchers.push([watchExp,watchListener]);
            return function disposable(){}
          }
        }

        function ElementFactory() {
          return {
            '0': {},
            classList: {},
            attributes: {},
            toggleClass( className, toggle? ){
              if ( toggle ) {
                this.classList[ className ] = true;
              } else {
                delete this.classList[ className ];
              }
              //this.classList[ className ] = toggle;
            },
            attr( attrName, value ){
              this.attributes[ attrName ] = value;
            }
          }
        }

        let $scope;
        let $element;
        let hostBindings = {
          classes: {'is-foo':'isFoo'} as StringMap,
          attributes: {'aria-label':'aria'} as StringMap,
          properties: {'style.fontSize':'fontSize'} as StringMap
        };
        let ctrl = { isFoo: true, aria: 'hello', fontSize: 12 };

        beforeEach( ()=> {
          $scope = new $Scope();
          $element = ElementFactory();
        } );

        it( `should create array of scope.$watch disposable callbacks`, ()=> {

          const actual = _setHostBindings( $scope, $element, ctrl, hostBindings );

          expect( actual.length ).to.deep.equal( 3 );
          expect( actual.every(isFunction) ).to.deep.equal( true );
          expect( $scope.$$watchers.length ).to.equal( 3 );

        } );

        it( `should toggle host bindings appropriately for class bindings`, ()=> {

          const actual = _setHostBindings( $scope, $element, ctrl, hostBindings );

          const classWatcher = $scope.$$watchers[0];
          const [watchExp,watchListener] = classWatcher;

          expect(watchExp()).to.equal(true);

          watchListener(true);
          expect( $element.classList[ 'is-foo' ] ).to.equal( true );

          watchListener(false);
          expect( $element.classList[ 'is-foo' ] ).to.equal( undefined );

        } );

        it( `should toggle host bindings appropriately for attr bindings`, ()=> {

          const actual = _setHostBindings( $scope, $element, ctrl, hostBindings );

          const attrWatcher = $scope.$$watchers[1];
          const [watchExp,watchListener] = attrWatcher;

          expect(watchExp()).to.equal('hello');

          watchListener('nope');
          expect( $element.attributes[ 'aria-label' ] ).to.equal( 'nope' );

          watchListener('yay');
          expect( $element.attributes[ 'aria-label' ] ).to.equal( 'yay' );

        } );

        it( `should toggle host bindings appropriately for prop bindings`, ()=> {

          const actual = _setHostBindings( $scope, $element, ctrl, hostBindings );

          const propWatcher = $scope.$$watchers[2];
          const [watchExp,watchListener] = propWatcher;

          expect( watchExp() ).to.equal( 12 );

          watchListener('12px');
          expect( $element[0][ 'style' ][ 'fontSize' ] ).to.equal( '12px' );

          watchListener( '2rem' );
          expect( $element[0][ 'style' ][ 'fontSize' ] ).to.equal( '2rem' );

        } );

      } );

    } );

  } );

} );
