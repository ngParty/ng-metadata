import { expect } from 'chai';
import * as sinon from 'sinon';

import { isAttrDirective } from '../../../src/core/directives/directives_utils';
import { isComponentDirective } from '../../../src/core/directives/directives_utils';
import { $Scope, ElementFactory } from '../../utils';
import { _setupDestroyHandler } from '../../../src/core/directives/directives_utils';
import { ComponentMetadata, DirectiveMetadata } from '../../../src/core/directives/metadata_directives';

describe( `directives/directives_utils`, () => {

  const sandbox = sinon.sandbox.create();

  afterEach( () => {

    sandbox.restore();

  } );

  describe( `IS utils`, () => {

    const cmp = new ComponentMetadata( {
      selector: 'cmp',
      template: `hello`
    } );

    const directive = new DirectiveMetadata( {
      selector: '[attr-dir]'
    } );

    describe( `#isAttrDirective`, () => {

      it( `should check if instance is Attribute Directive`, () => {

        expect( isAttrDirective( directive ) ).to.equal( true );
        expect( isAttrDirective( cmp ) ).to.not.equal( true );

      } );

    } );

    describe( `#isComponentDirective`, () => {

      it( `should check if instance is Component`, () => {

        expect( isComponentDirective( directive ) ).to.equal( false );
        expect( isComponentDirective( cmp ) ).to.equal( true );

      } );

    } );

  } );

  describe( `#_setupDestroyHandler`, () => {

    class MyComponent {
      ngOnDestroy() {}
    }

    let $scope;
    let $element;
    let ctrl: MyComponent;
    let watchers;
    let observers;

    beforeEach( () => {
      $scope = new $Scope();
      $element = ElementFactory();
      ctrl = new MyComponent();
      watchers = [];
      observers = [];
    } );

    it( `should properly setup cleanup on directive destroy`, () => {

      sandbox.spy( ctrl, 'ngOnDestroy' );

      _setupDestroyHandler( $scope as any, $element as any, ctrl, true, watchers, observers );

      $scope.$$events[ 0 ].cb();

      expect( (ctrl.ngOnDestroy as Sinon.SinonSpy).called ).to.equal( true );

    } );

    it( `should trigger $element.$destroy event on element removal`, () => {

      var destroyHandlerSpy = sandbox.spy();

      $element.on( "$destroy", destroyHandlerSpy );

      _setupDestroyHandler( $scope as any, $element as any, ctrl, true, watchers, observers );

      $scope.$$events[ 0 ].cb();

      $element.remove();

      expect( destroyHandlerSpy.called ).to.equal( true );

    } );

  } );

} );
