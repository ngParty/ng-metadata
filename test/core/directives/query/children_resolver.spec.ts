import { expect } from 'chai';
import * as sinon from 'sinon';

import { ElementFactory } from '../../../utils';
import { global, noop } from '../../../../src/facade/lang';
import {
  Component,
  Directive,
  HostBinding,
  HostListener,
  ViewChild,
  ContentChild
} from '../../../../src/core/directives/decorators';
import {
  _resolveChildrenFactory,
  _getChildElements,
  getControllerOnElement,
  _getSelectorAndCtrlName,
  _getSelector,
  _getParentCheckNotifiers
} from '../../../../src/core/directives/query/children_resolver';
import { DirectiveCtrl } from '../../../../src/core/directives/constants';
import { Inject } from '../../../../src/core/di/decorators';
import { forwardRef } from '../../../../src/core/di/forward_ref';

describe( `directives/query/children_resolver`, () => {

  describe( `#_resolveChildrenFactory`, ()=> {

    let $element;
    let ctrl;
    let mockedCtrlInstance;
    const sandbox = sinon.sandbox.create();
    let multiRef;

    beforeEach( ()=> {

      $element = ElementFactory();
      ctrl = {};
      mockedCtrlInstance = {
        iamHere: true
      };

      sandbox.stub( $element[ '0' ], 'querySelector' )
        .returns( $element[ 0 ] );
      sandbox.stub( $element[ '0' ], 'querySelectorAll' )
        .returns( [ $element[ 0 ], $element[ 0 ], $element[ 0 ] ] );
      //sinon.stub( $element, 'data' ).withArgs( '$mockedCtrlController' ).returns( mockedCtrlInstance );
      sinon.stub( $element, 'controller' )
        .withArgs( 'fooCmp' ).returns( mockedCtrlInstance )
        .withArgs( 'fooChildCmp' ).returns( mockedCtrlInstance );

      global.angular = {
        element(DOMorString){
          multiRef = [ $element, $element, $element ];
          (multiRef as any).eq = function ( idx: number ) {
            return this[ idx ];
          };
          return DOMorString.length > 1 ? multiRef : $element
        }
      } as any;

    } );
    afterEach( ()=> {

      sandbox.restore();

    } );

    it( `should return just jqLite element if querying for string`, ()=> {

      const viewChildResolver = _resolveChildrenFactory( $element, ctrl, 'oneCmp', '.hello', 'view', true );
      viewChildResolver();

      expect( $element.controller.called ).to.equal( false );
      expect( ctrl.oneCmp ).to.equal( $element );

    } );
    it( `should return just jqLite element collection if querying for string`, ()=> {

      const viewChildrenResolver = _resolveChildrenFactory( $element, ctrl, 'oneCmpList', '.yo-mama', 'view' );
      viewChildrenResolver();

      expect( $element.controller.called ).to.equal( false );
      expect( ctrl.oneCmpList ).to.equal( multiRef );

    } );

    it( `should set view child instance on controller`, ()=> {

      @Component({selector:'foo-cmp',template:'foo'})
      class Foo{}

      const viewChildResolver = _resolveChildrenFactory( $element, ctrl, 'oneCmp', Foo, 'view', true );

      viewChildResolver();

      expect( $element.controller.calledWith('fooCmp') ).to.equal( true );
      expect( ctrl ).to.deep.equal( { oneCmp: { iamHere: true } } );

    } );
    it( `should set view children instances on controller`, ()=> {

      @Component({selector:'foo-cmp',template:'foo'})
      class Foo{}

      const viewChildrenResolver = _resolveChildrenFactory( $element, ctrl, 'oneCmpList', Foo, 'view' );
      viewChildrenResolver();

      expect( $element.controller.calledWith('fooCmp') ).to.equal( true );
      expect( ctrl.oneCmpList ).to.deep.equal( [{ iamHere: true },{ iamHere: true },{ iamHere: true }] );

    } );
    it( `should set content child instance on controller`, ()=> {

      @Component({selector:'foo-child-cmp',template:'foo'})
      class Foo{}

      const contentChildResolver = _resolveChildrenFactory( $element, ctrl, 'oneCmp', Foo, 'content', true );
      contentChildResolver();

      expect( $element.controller.calledWith('fooChildCmp') ).to.equal( true );
      expect( ctrl ).to.deep.equal( { oneCmp: { iamHere: true } } );

    } );
    it( `should set content children instances on controller`, ()=> {

      @Component({selector:'foo-child-cmp',template:'foo'})
      class Foo{}

      const contentChildrenResolver = _resolveChildrenFactory( $element, ctrl, 'oneCmpList', Foo, 'content' );

      contentChildrenResolver();

      expect( $element.controller.calledWith('fooChildCmp') ).to.equal( true );
      expect( ctrl.oneCmpList ).to.deep.equal( [{ iamHere: true },{ iamHere: true },{ iamHere: true }] );
      //contentChildrenResolver();
      //expect( $element.controller.calledWith('fooChildCmp') ).to.equal( true );
      //expect( ctrl ).to.deep.equal( { oneCmpList: { iamHere: true } } );

    } );

  } );

  describe( `#_getChildElements`, ()=> {

    let $element;
    const sandbox = sinon.sandbox.create();

    beforeEach( ()=> {

      $element = ElementFactory();

      sandbox.stub( $element[ '0' ], 'querySelector' );
      sandbox.stub( $element[ '0' ], 'querySelectorAll' );

      global.angular = {
        element(DOMorString){ return ElementFactory() }
      } as any;

    } );
    afterEach( ()=> {

      sandbox.restore();

    } );

    it( `should query for first view child if firstOnly and type==view`, ()=> {

      const actual = _getChildElements( $element, 'view-child-item', 'view', true );

      expect( $element[ 0 ].querySelector.called ).to.equal( true );
      expect( $element[ 0 ].querySelector.calledWith( ':not(ng-transclude):not([ng-transclude]) > view-child-item' ) )
        .to
        .equal( true );

    } );

    it( `should query for all view children if firstOnly and type==view`, ()=> {

      const actual = _getChildElements( $element, 'view-child-item', 'view' );

      expect( $element[ 0 ].querySelectorAll.called ).to.equal( true );
      expect( $element[ 0 ].querySelectorAll.calledWith( ':not(ng-transclude):not([ng-transclude]) > view-child-item' ) )
        .to
        .equal( true );

    } );

    it( `should query for first content child if firstOnly and type==content`, ()=> {

      const actual = _getChildElements( $element, 'content-child-item', 'content', true );

      expect( $element[ 0 ].querySelector.called ).to.equal( true );
      expect( $element[ 0 ].querySelector.calledWith(
        'ng-transclude content-child-item, [ng-transclude] content-child-item' ) )
        .to
        .equal( true );

    } );

    it( `should query for all content children if firstOnly and type==content`, ()=> {

      const actual = _getChildElements( $element, 'content-child-item', 'content' );

      expect( $element[ 0 ].querySelectorAll.called ).to.equal( true );
      expect( $element[ 0 ].querySelectorAll.calledWith(
        'ng-transclude content-child-item, [ng-transclude] content-child-item' ) )
        .to
        .equal( true );

    } );


  } );

  describe( `#getControllerOnElement`, ()=> {

    let $element;
    beforeEach( ()=> {

      $element = ElementFactory()

    } );

    it( `should return demanded ctrl instance on element`, ()=> {

      const mockedCtrlInstance = {};
      //sinon.stub( $element, 'data' ).withArgs( '$mockedCtrlController' ).returns( mockedCtrlInstance );
      sinon.stub( $element, 'controller' ).withArgs( 'mockedCtrl' ).returns( mockedCtrlInstance );

      expect( getControllerOnElement( $element, 'mockedCtrl' ) ).to.equal( mockedCtrlInstance );

    } );

    it( `should return null if demanded ctrl doesn't exist on provided element`, ()=> {

      //sinon.stub( $element, 'data' ).withArgs( '$mockedCtrlController' ).returns( mockedCtrlInstance );
      sinon.stub( $element, 'controller' ).withArgs( 'noneCtrl' ).returns( null );

      expect( getControllerOnElement( $element, 'noneCtrl' ) ).to.equal( null )

    } );

  } );

  describe( `#_getSelectorAndCtrlName`, ()=> {

    it( `should return map containing CSS selector and injectable name string`, ()=> {

      @Directive( { selector: '[hello-world]' } )
      class HelloDirective {
      }

      @Component( { selector: 'my-cmp', template: 'hello' } )
      class HelloComponent {
      }

      expect( _getSelectorAndCtrlName( HelloDirective ) ).to.deep.equal( {
        selector: '[hello-world]',
        childCtrlName: 'helloWorld'
      } );
      expect( _getSelectorAndCtrlName( HelloComponent ) ).to.deep.equal( {
        selector: 'my-cmp',
        childCtrlName: 'myCmp'
      } );

    } );

  } );

  describe( `#_getSelector`, ()=> {

    it( `should get selector metadata from component/directive decorated class`, ()=> {

      @Directive({selector:'[hello-world]'})
      class HelloDirective{}

      @Component({selector:'my-cmp',template:'hello'})
      class HelloComponent{}

      expect(_getSelector(HelloDirective)).to.equal('[hello-world]');
      expect( _getSelector( HelloComponent ) ).to.equal( 'my-cmp' );

    } );

    it( `should return same value when input is string`, ()=> {

      expect( _getSelector( 'hey-foo' ) ).to.equal( 'hey-foo' );

    } );


  } );

  describe( `#_getParentCheckNotifiers`, ()=> {

    it( `should return empty array with noop if no queries found on parent`, ()=> {

      @Component( { selector: 'ctrl', template: 'this is it' } )
      class Ctrl {
      }

      const actual = _getParentCheckNotifiers( new Ctrl() as DirectiveCtrl, [ {} ] );
      const expected = [noop];

      expect( actual ).to.deep.equal( expected );

    } );

    it( `should return empty array with noop if no property decorators exist on parent`, ()=> {

      @Component( { selector: 'foo', template: 'hello' } )
      class Foo {
      }

      @Component( { selector: 'ctrl', template: 'this is it' } )
      class Ctrl {
      }

      const requiredCtrl = [ new Foo() ];
      const ctrl = new Ctrl() as DirectiveCtrl;

      const actual = _getParentCheckNotifiers( ctrl, requiredCtrl );
      const expected = [ noop ];

      expect( actual ).to.deep.equal( expected );

    } );

    it( `should return skip non @Query parameter decorators`, ()=> {

      @Component( { selector: 'foo', template: 'hello' } )
      class Foo {
        @HostBinding('attr.aria-disabled') isDisabled: boolean;
        @HostListener('blur') onBlur(){}
      }

      @Component( { selector: 'ctrl', template: 'this is it' } )
      class Ctrl {
      }

      const requiredCtrl = [ new Foo() ];
      const ctrl = new Ctrl() as DirectiveCtrl;

      const actual = _getParentCheckNotifiers( ctrl, requiredCtrl );
      const expected = [ noop ];

      expect( actual ).to.deep.equal( expected );

    } );

    it( `should return notifier functions if parent @Queryies child and child @Injects parent`, ()=> {

      @Component( { selector: 'ctrl', template: 'this is it' } )
      class Ctrl {
        constructor(
          @Inject(forwardRef(()=>Foo)) private foo
        ){}
      }

      @Component( { selector: 'ctrl-content', template: 'this is it' } )
      class CtrlContent {
        constructor(
          @Inject(forwardRef(()=>Foo)) private foo
        ){}
      }

      @Component( { selector: 'foo', template: 'hello' } )
      class Foo {
        @ViewChild(Ctrl) _ctrl: Ctrl;
        @ContentChild(CtrlContent) _ctrlContent: CtrlContent;
        @HostListener('blur') onBlur(){}

        ngAfterViewInit(){}
        ngAfterViewChecked(){}
        ngAfterContentChecked(){}
        ngAfterContentInit(){}
        _ngOnChildrenChanged(){}
      }

      let requiredCtrl = [ new Foo() ];
      let ctrlInView = new Ctrl(new Foo());
      let ctrlInContent = new CtrlContent(new Foo());

      const spyParentChildrenChanged = sinon.spy(requiredCtrl[0],'_ngOnChildrenChanged');
      const viewChildActual = _getParentCheckNotifiers( ctrlInView as any, requiredCtrl );
      const contentChildActual = _getParentCheckNotifiers( ctrlInContent as any, requiredCtrl );

      expect( viewChildActual.length ).to.equal( 1 );
      expect( viewChildActual[0] ).to.not.equal( noop );

      expect( contentChildActual.length ).to.equal( 1 );
      expect( contentChildActual[0] ).to.not.equal( noop );

      viewChildActual[ 0 ]();

      expect( spyParentChildrenChanged.calledOnce ).to.equal( true );

      contentChildActual[ 0 ]();

      expect( spyParentChildrenChanged.calledTwice ).to.equal( true );

    } );

  } );

} );
