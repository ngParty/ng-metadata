import { expect } from 'chai';
import * as sinon from 'sinon';

import { $Scope, ElementFactory } from '../../../utils';
import {
  _setHostBindings, _setHostListeners,
  _getHostListenerCbParams
} from '../../../../src/core/directives/host/host_resolver';
import { isFunction } from '../../../../src/facade/lang';

describe( `directives/host/host_resolver`, () => {

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
      onClick: sandbox.spy( ( evt ) => { return false } ),
      onMove: sandbox.spy( ( x, y ) => {} ),
      onOut: sandbox.spy( () => {} ),
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
      _setHostListeners( $scope as any, $element as any, ctrl, hostListeners );
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

    it( `should call event.preventDefault if ctrl method call returns false`, ()=> {

      const [{cb:clickCb}] = $element._eventListeners;

      expect( event.preventDefault.called ).to.equal( false );

      clickCb( event );

      expect( event.preventDefault.called ).to.equal( true );

    } );

    it( `should not call event.preventDefault if ctrl method call doesn't return false`, ()=> {

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
