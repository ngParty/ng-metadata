import { expect } from 'chai';
import { isFunction } from '../../../src/facade/lang';
import {
  downgradeNg2Injectable,
  provideNg2Injectable,
  _downgradeInjectable
} from '../../../src/upgrade/static/downgrade_injectable';
import { Injectable } from '../../../src/core/di/decorators';
import { OpaqueToken } from '../../../src/core/di/opaque_token';
import { globalKeyRegistry } from '../../../src/core/di/key';

describe( `downgrade_injectable`, () => {

  function dummyNg2DowngradedResult(){}
  function downgradeFn(injectable:any){return dummyNg2DowngradedResult}

  class Ng2Injectable{}

  beforeEach( () => {
    globalKeyRegistry._reset();
  } );

  describe( `downgradeNg2Injectable`, () => {
    it( `should be a function`, () => {
      expect(isFunction(downgradeNg2Injectable)).to.equal(true);
    } );
  } );
  describe( `provideNg2Injectable`, () => {
    it( `should be a function`, () => {
      expect(isFunction(provideNg2Injectable)).to.equal(true);
    } );
  } );
  describe( `_downgradeInjectable`, () => {

    it( `should return ProviderType for ngMetadata factory registration`, () => {

      const provider = _downgradeInjectable( {
        token: 'foo',
        injectable: Ng2Injectable,
        downgradeFn: downgradeFn
      } );

      expect( provider.name ).to.equal( 'foo' );
      expect( provider.factoryFn ).to.equal( dummyNg2DowngradedResult );
      expect( provider.deps ).to.deep.equal( [] );

    } );

    describe( `token supports`, () => {

      it( `should support string`, () => {
        const provider = _downgradeInjectable( {
          token: 'foo',
          injectable: Ng2Injectable,
          downgradeFn: downgradeFn
        } );

        expect(provider.name).to.equal('foo');
      } );
      it( `should support ngMetadata OpaqueToken`, () => {
        const provider = _downgradeInjectable( {
          token: new OpaqueToken('boom'),
          injectable: Ng2Injectable,
          downgradeFn: downgradeFn
        } );

        expect(provider.name).to.equal('boom');
      } );
      it( `should support ng2Injectable decorated with ngMetadata Injectable`, () => {
        @Injectable()
        class NgMetadataInjectable{}

        const provider = _downgradeInjectable( {
          token: NgMetadataInjectable as any,
          injectable: Ng2Injectable,
          downgradeFn: downgradeFn
        } );

        expect(provider.name).to.equal('ngMetadataInjectable#1');
      } );
    } );

  } );
} );
