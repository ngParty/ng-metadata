import { expect } from 'chai';
import * as sinon from 'sinon';
import { NgMetadataUpgradeAdapter } from '../../src/upgrade/upgrade_adapter'
import { Component, OpaqueToken, getInjectableName, NgModule } from '../../core'
import { reflector } from '../../src/core/reflection/reflection';
import { Type } from '../../src/facade/type';

class MockAngularUpgradeAdapter {
  constructor(ngModule: Type) {}
  bootstrap(element: Element, modules?: any[], config?: ng.IAngularBootstrapConfig): void {
    return void 0
  }
  downgradeNg2Provider(token: any): Function {
    return (() => {})
  }
  upgradeNg1Provider(name: string, options?: { asToken: any; }): void {
    return void 0
  }
  downgradeNg2Component(type: Type): Function {
    return (() => {})
  }
}

let instantiatedNgUpgradeAdapter: MockAngularUpgradeAdapter
let upgradeAdapter: NgMetadataUpgradeAdapter

describe( `upgrade`, () => {

  describe( `NgMetadataUpgradeAdapter`, () => {

    let sandbox: Sinon.SinonSandbox;

    beforeEach( () => {

      sandbox = sinon.sandbox.create();

      @NgModule({})
      class AppModule {}

      instantiatedNgUpgradeAdapter = new MockAngularUpgradeAdapter(AppModule)
      upgradeAdapter = new NgMetadataUpgradeAdapter(instantiatedNgUpgradeAdapter)

    } );

    afterEach( () => {
      sandbox.restore();
    } );

    it( `should store a reference to the given upgradeAdapter singleton`, () => {
      expect( JSON.stringify( upgradeAdapter._upgradeAdapter ) ).to.equal( JSON.stringify( instantiatedNgUpgradeAdapter ) );
    } );

    describe( `#upgradeNg1Provider`, () => {

      it( `should call the internal adapter's upgradeNg1Provider() method with the given provider name`, () => {

          sandbox.spy( upgradeAdapter._upgradeAdapter, 'upgradeNg1Provider' );

          const ng1ProviderName = 'ng1Provider'

          upgradeAdapter.upgradeNg1Provider( ng1ProviderName );

          expect( (upgradeAdapter._upgradeAdapter.upgradeNg1Provider as Sinon.SinonSpy).calledWith( ng1ProviderName ) ).to.equal( true );

      } );

      it( `should support passing the "asToken" option to the upgradeAdapter`, () => {

          sandbox.spy( upgradeAdapter._upgradeAdapter, 'upgradeNg1Provider' );

          class Ng1Token {}

          const ng1ProviderName = 'ng1Provider'
          const options = {
            asToken: Ng1Token,
          }

          upgradeAdapter.upgradeNg1Provider( ng1ProviderName, options );

          expect( (upgradeAdapter._upgradeAdapter.upgradeNg1Provider as Sinon.SinonSpy).calledWith( ng1ProviderName, options ) ).to.equal( true );

      } );

    } );

    describe( `#downgradeNg2Provider`, () => {

      it( `should call the internal adapter's downgradeNg2Provider() method with the given Angular 2 provider`, () => {

          sandbox.spy( upgradeAdapter._upgradeAdapter, 'downgradeNg2Provider' );

          const ng2ProviderName = 'ng2Provider'

          class Ng2Provider {}

          upgradeAdapter.downgradeNg2Provider( ng2ProviderName, { useClass: Ng2Provider } );

          expect( (upgradeAdapter._upgradeAdapter.downgradeNg2Provider as Sinon.SinonSpy).calledWith( Ng2Provider ) ).to.equal( true );

      } );

      it( `should return the downgraded provider as the second value in the array`, () => {

          const downgradedProvider = () => {}

          sandbox.stub( upgradeAdapter._upgradeAdapter, 'downgradeNg2Provider' ).returns( downgradedProvider );

          const ng2ProviderName = 'ng2Provider'

          class Ng2Provider {}

          expect( upgradeAdapter.downgradeNg2Provider( ng2ProviderName, { useClass: Ng2Provider } )[ 1 ] ).to.equal( downgradedProvider );

      } );

      it( `should return the given name as the first value in the array, supporting both string and OpaqueToken`, () => {

          const downgradedProvider = () => {}

          sandbox.stub( upgradeAdapter._upgradeAdapter, 'downgradeNg2Provider' ).returns( downgradedProvider );

          const ng2ProviderName = 'ng2Provider'
          const ng2ProviderToken = new OpaqueToken( 'ng2Provider' )

          class Ng2Provider {}

          expect( upgradeAdapter.downgradeNg2Provider( ng2ProviderName, { useClass: Ng2Provider } )[ 0 ] ).to.equal( getInjectableName( ng2ProviderName ) );
          expect( upgradeAdapter.downgradeNg2Provider( ng2ProviderToken, { useClass: Ng2Provider } )[ 0 ] ).to.equal( getInjectableName( ng2ProviderToken ) );

      } );

    } );

    describe( `#provideNg2Provider`, () => {

      it( `should call the internal adapter's downgradeNg2Provider() method with the given Angular 2 provider`, () => {

          sandbox.spy( upgradeAdapter._upgradeAdapter, 'downgradeNg2Provider' );

          const ng2ProviderName = 'ng2Provider'

          class Ng2Provider {}

          upgradeAdapter.provideNg2Provider( ng2ProviderName, { useClass: Ng2Provider } );

          expect( (upgradeAdapter._upgradeAdapter.downgradeNg2Provider as Sinon.SinonSpy).calledWith( Ng2Provider ) ).to.equal( true );

      } );

      it( `should return the downgraded provider as the "useFactory" value on the object`, () => {

          const downgradedProvider = () => {}

          sandbox.stub( upgradeAdapter._upgradeAdapter, 'downgradeNg2Provider' ).returns( downgradedProvider );

          const ng2ProviderName = 'ng2Provider'

          class Ng2Provider {}

          expect( upgradeAdapter.provideNg2Provider( ng2ProviderName, { useClass: Ng2Provider } ).useFactory ).to.equal( downgradedProvider );

      } );

      it( `should return the given name as the "provide" value on the object, supporting both string and OpaqueToken`, () => {

          const downgradedProvider = () => {}

          sandbox.stub( upgradeAdapter._upgradeAdapter, 'downgradeNg2Provider' ).returns( downgradedProvider );

          const ng2ProviderName = 'ng2Provider'
          const ng2ProviderToken = new OpaqueToken( 'ng2Provider' )

          class Ng2Provider {}

          expect( upgradeAdapter.provideNg2Provider( ng2ProviderName, { useClass: Ng2Provider } ).provide ).to.equal( getInjectableName( ng2ProviderName ) );
          expect( upgradeAdapter.provideNg2Provider( ng2ProviderToken, { useClass: Ng2Provider } ).provide ).to.equal( getInjectableName( ng2ProviderToken ) );

      } );

      it( `should return the downgraded provider's depdencies as the "deps" value on the object`, () => {

          const dependencies = [ 'foo' ]
          const downgradedProvider = () => {}
          downgradedProvider.$inject = dependencies

          sandbox.stub( upgradeAdapter._upgradeAdapter, 'downgradeNg2Provider' ).returns( downgradedProvider );

          const ng2ProviderName = 'ng2Provider'

          class Ng2Provider {}

          expect( upgradeAdapter.provideNg2Provider( ng2ProviderName, { useClass: Ng2Provider } ).deps ).to.equal( dependencies );

      } );

    } );

    describe( `#downgradeNg2Component`, () => {

      it( `should call the internal adapter's downgradeNg2Component() method with the given provider`, () => {

          sandbox.spy( upgradeAdapter._upgradeAdapter, 'downgradeNg2Component' );

          @Component({
            selector: 'foo-bar',
          })
          class Ng2Component {}

          upgradeAdapter.downgradeNg2Component( Ng2Component );

          expect( (upgradeAdapter._upgradeAdapter.downgradeNg2Component as Sinon.SinonSpy).calledWith( Ng2Component ) ).to.equal( true );

      } );

      it( `should convert the selector annotation to camelcase and return it as the first value in the array`, () => {

          @Component({
            selector: 'foo-bar',
          })
          class Ng2Component {}

          upgradeAdapter.downgradeNg2Component( Ng2Component );

          expect( upgradeAdapter.downgradeNg2Component( Ng2Component )[ 0 ] ).to.equal( 'fooBar' );

      } );

      it( `should set the return value from the internal adapter's downgradeNg2Component() as the second value in the array`, () => {

          const downgradedComponent = () => {}

          sandbox.stub( upgradeAdapter._upgradeAdapter, 'downgradeNg2Component' ).returns( downgradedComponent );

          @Component({
            selector: 'foo-bar',
          })
          class Ng2Component {}

          upgradeAdapter.downgradeNg2Component( Ng2Component );

          expect( upgradeAdapter.downgradeNg2Component( Ng2Component )[ 1 ] ).to.equal( downgradedComponent );

      } );

    } );

    describe( `#provideNg2Component`, () => {

      it( `should call upgradeAdapter.downgradeNg2Component() with the given provider`, () => {

          sandbox.spy( upgradeAdapter, 'downgradeNg2Component' );

          @Component({
            selector: 'foo-bar',
          })
          class Ng2Component {}

          upgradeAdapter.provideNg2Component( Ng2Component );

          expect( (upgradeAdapter.downgradeNg2Component as Sinon.SinonSpy).calledWith( Ng2Component ) ).to.equal( true );

      } );

      it( `should return the downgraded component factory function`, () => {

          const downgradedComponent = () => {}

          sandbox.stub( upgradeAdapter, 'downgradeNg2Component' ).returns([ 'fooBar', downgradedComponent ] );

          @Component({
            selector: 'foo-bar',
          })
          class Ng2Component {}

          expect( upgradeAdapter.provideNg2Component( Ng2Component ) ).to.equal( downgradedComponent );

      } );

      it( `should register the downgradedNg2ComponentName metadata on the directive factory`, () => {

          @Component({
            selector: 'foo-bar',
          })
          class Ng2Component {}

          const downgradedDirectiveFactory = upgradeAdapter.provideNg2Component( Ng2Component )

          expect( reflector.downgradedNg2ComponentName( downgradedDirectiveFactory ) ).to.equal( 'fooBar' );

      } );

    } );

  } );

} );
