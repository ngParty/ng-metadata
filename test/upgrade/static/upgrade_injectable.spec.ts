import { expect } from 'chai';
import { upgradeInjectable } from '../../../src/upgrade/static/upgrade_injectable';
import { isFunction } from '../../../src/facade/lang';
import { OpaqueToken } from '../../../src/core/di/opaque_token';
import { Injectable } from '../../../src/core/di/decorators';
import { globalKeyRegistry } from '../../../src/core/di/key';

describe(`upgrade_injectable`, () => {

  it(`should be a function`, () => {
    expect(isFunction(upgradeInjectable)).to.equal(true)
  });

  it(`should return ng2 factory provider`, () => {
    const actual = upgradeInjectable('helloSvc');
    const expected = {
      provide: 'helloSvc',
      useFactory: ()=>({}),
      deps: ['$injector']
    };

    expect(Object.keys(actual)).to.deep.equal(['provide','useFactory','deps']);
    expect(actual.provide).to.equal('helloSvc');
    expect(isFunction(actual.useFactory)).to.equal(true);
    expect(actual.deps).to.deep.equal(['$injector']);
  });

  describe(`injectable/asToken supports`, () => {

    const $injector: any = {
      get(injectableName:string){
        return injectableName
      }
    };
    function getInjectable(ng2ProviderDefinition:any){
      return ng2ProviderDefinition.useFactory($injector)
    }

    beforeEach( () => {
      globalKeyRegistry._reset();
    } );

    it( `should support injectable as string`, () => {
      const provider = upgradeInjectable('helloSvc');
      const actual = getInjectable(provider);

      expect( actual ).to.equal( 'helloSvc' );
    } );
    it( `should support injectable as OpaqueToken`, () => {
      const injectable = new OpaqueToken( 'boom' );
      const provider = upgradeInjectable( injectable );

      const actual = getInjectable(provider);
      expect( actual ).to.equal( 'boom' );
    } );
    it( `should support injectable as decorated Type`, () => {
      @Injectable()
      class HelloService {}
      const provider = upgradeInjectable(HelloService);

      const actual = getInjectable(provider);
      expect( actual ).to.equal( 'helloService#1' );
    } );
    it( `should throw if user provides undecorated Type as injectable`, () => {
      class HelloService {}
      const provider = upgradeInjectable(HelloService);

      const actual = ()=>getInjectable(provider);
      expect(actual).to.throw;
    } );
    it( `should support optional asToken if we wanna register undecorated type to ng2`, () => {
      class NonNgMetadataService {}
      const provider = upgradeInjectable('helloSvc',NonNgMetadataService);

      expect( provider.provide ).to.equal( NonNgMetadataService );
      expect( getInjectable(provider) ).to.equal( 'helloSvc' );
    } );

  });
});
