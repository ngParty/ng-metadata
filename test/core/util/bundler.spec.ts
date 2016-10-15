import * as sinon from 'sinon';
import { expect } from 'chai';
import { global } from '../../../src/facade/lang';
import { Component, NgModule } from '../../../src/core/directives/decorators';
import { createAngular1Module } from '../../utils';
import { provide } from '../../../src/core/di';
import { bundle } from '../../../src/core/util/bundler';
import { Pipe } from '../../../src/core/pipes/decorators';
import { Injectable } from '../../../src/core/di/decorators';
import { OpaqueToken } from '../../../src/core/di/opaque_token';
import { Directive } from '../../../src/core/directives/decorators';

describe( `util/bundler`, () => {

  let sandbox: Sinon.SinonSandbox;
  beforeEach( () => {
    global.angular = createAngular1Module() as any;
    sandbox = sinon.sandbox.create();
  } );
  afterEach( () => {
    sandbox.restore();
  } );

  describe( `#bundle`, () => {


    @Pipe( { name: 'ups' } )
    class UpsPipe {
      transform( input: string ) {}
    }

    @Injectable()
    class SomeGlobalService {
    }

    @Injectable()
    class MySingleton {
    }

    @Injectable()
    class MyService {
    }

    @Injectable()
    class OtherService {
    }

    @Injectable()
    class MyPrivateService {
    }

    @Injectable()
    class ViaProviderLiteralService {
    }

    @Component( {
      selector: 'nested',
      template: `Im nested`,
      viewProviders: [ MyPrivateService ]
    } )
    class NestedComponent {
    }

    @Component( {
      selector: 'child-one',
      providers: [ MyService, 'ui.bootstrap.modal' ],
      template: `hello Im childOne <nested></nested>`
    } )
    class ChildOneComponent {
    }

    const MyFactoryToken = new OpaqueToken( 'myFactory' );
    @Component( {
      selector: 'child-two',
      providers: [ OtherService, MyService, { provide: MyFactoryToken, deps: [ '$q' ], useFactory: ( $q )=>({}) } ],
      template: `hello Im childTwo <nested></nested>`
    } )
    class ChildTwoComponent {
    }

    @Component( {
      selector: 'app',
      providers: [ MySingleton, { provide: 'tokenAsClass', useClass: ViaProviderLiteralService } ],
      template: `Hello App
        <child-one></child-one>
        <child-two></child-two>
      `
    } )
    class AppComponent {
    }

    it( `should use an existing Angular 1 module, if one is provided`, () => {

      @NgModule({
        declarations: [ AppComponent, ChildOneComponent, UpsPipe, NestedComponent, ChildTwoComponent ],
      })
      class AppModule {
      }

      const existingAngular1Module = createAngular1Module().module( 'existing', [] );

      const angular1Module = bundle( AppModule );
      const angular1ModuleUsingExisting = bundle( AppModule, [], existingAngular1Module as any );

      expect( angular1Module.name ).to.contain( 'appModule' );
      expect( angular1ModuleUsingExisting.name ).to.equal( 'existing' );

    } );

    it( `should parse whole component tree and register all providers,viewProviders,pipes,directives`, () => {

      const thirdPartyModule = createAngular1Module().module( '3rdParty', [] ).name;

      @NgModule({
        declarations: [ AppComponent, ChildOneComponent, UpsPipe, NestedComponent, ChildTwoComponent ],
        providers: [ SomeGlobalService ],
        imports: [ thirdPartyModule ]
      })
      class AppModule {
      }

      const angular1Module = bundle( AppModule );

      const expectedInvokeQueue = [
        [ '$compileProvider', 'directive', provide( AppComponent ) ],
        [ '$provide', 'service', provide( MySingleton ) ],
        [ '$provide', 'service', provide( 'tokenAsClass', { useClass: ViaProviderLiteralService } ) ],
        [ '$compileProvider', 'directive', provide( ChildOneComponent ) ],
        [ '$provide', 'service', provide( MyService ) ],
        [ '$filterProvider', 'register', provide( UpsPipe ) ],
        [ '$compileProvider', 'directive', provide( NestedComponent ) ],
        [ '$provide', 'service', provide( MyPrivateService ) ],
        [ '$compileProvider', 'directive', provide( ChildTwoComponent ) ],
        [ '$provide', 'service', provide( OtherService ) ],
        [ '$provide', 'factory', provide( MyFactoryToken, { useFactory: ()=>({}) } ) ],
        [ '$provide', 'service', provide( SomeGlobalService ) ]
      ];
      const actualInvokeQueue = (angular1Module as any)._invokeQueue;
      const actual = _invokeQueueToCompare( actualInvokeQueue, false );
      const expected = _invokeQueueToCompare( expectedInvokeQueue, false );

      // console.log( 'actual:',actual );
      // console.log( '========' );
      // console.log( 'expected:',expected );

      expect( actual ).to.deep.equal( expected );
      expect( angular1Module.requires ).to.deep.equal( [ 'ui.bootstrap.modal','3rdParty' ] );

    } );

    it( `should support nested providers and normalize them`, () => {

      const PluginFooDirectives = [ NestedComponent ];
      const PluginFooProviders = [ MyService, MySingleton ];
      const PluginFooPipes = [ UpsPipe ];

      @Directive({selector:'[yo]'})
      class YoDirective {}

      @Component( {
        selector: 'app-with-plugin',
        template: 'hello',
        providers: [ PluginFooProviders, MyPrivateService ]
      } )
      class AppWithPluginComponent {}

      @NgModule({
        declarations: [ AppWithPluginComponent, PluginFooPipes, PluginFooDirectives, YoDirective ],
      })
      class AppWithPluginModule {
      }

      const angular1Module = bundle( AppWithPluginModule );

      const expectedInvokeQueue = [
        [ '$compileProvider', 'directive', provide( AppWithPluginComponent ) ],
        [ '$provide', 'service', provide( MyService ) ],
        [ '$provide', 'service', provide( MySingleton ) ],
        [ '$provide', 'service', provide( MyPrivateService ) ],
        [ '$filterProvider', 'register', provide( UpsPipe ) ],
        [ '$compileProvider', 'directive', provide( NestedComponent ) ],
        [ '$compileProvider', 'directive', provide( YoDirective ) ]
      ];
      const actualInvokeQueue = (angular1Module as any)._invokeQueue;
      const actual = _invokeQueueToCompare( actualInvokeQueue, false );
      const expected = _invokeQueueToCompare( expectedInvokeQueue, false );

      // console.log( 'actual:',actual );
      // console.log( '========' );
      // console.log( 'expected:',expected );

      expect( actual ).to.deep.equal( expected );

    } );

    it( `should allow angular1Module.config within otherProviders setup`, () => {

      @Injectable()
      class MyDynamicService {}

      configPhase.$inject = ['$provide'];
      function configPhase($provide: ng.auto.IProvideService){
        $provide.service( ...provide( MyDynamicService ) );
        $provide.factory(
          ...provide(
            'promiseWrapper',
            { deps: [ '$q' ], useFactory: ( value )=>( $q )=>$q.resolve() }
          )
        );
      }

      @Component( {
        selector: 'pure-app',
        template: 'hello'
      } )
      class PureAppComponent {}

      @NgModule({
        declarations: [ PureAppComponent ],
      })
      class AppModule {
      }

      const angular1Module = bundle( AppModule, [ configPhase ] );

      const expectedInvokeQueue = [
        [ '$compileProvider', 'directive', provide( PureAppComponent ) ],
        [ '$provide', 'service', provide( MyDynamicService ) ],
        [
          '$provide', 'factory', provide(
          'promiseWrapper',
          { deps: [ '$q' ], useFactory: ( value )=>( $q )=>$q.resolve() }
        )
        ],
      ];
      const expectedConfigBlocks = [
        [ '$injector', 'invoke', [ configPhase ] ]
      ];

      const actualConfigBlocks = (angular1Module as any)._configBlocks;
      const actualInvokeQueue = (angular1Module as any)._invokeQueue;

      expect( actualConfigBlocks ).to.deep.equal( expectedConfigBlocks );

      _execConfigBlocks(angular1Module);

      const actual = _invokeQueueToCompare( actualInvokeQueue, false );
      const expected = _invokeQueueToCompare( expectedInvokeQueue, false );

      // console.log( 'actual:',actual );
      // console.log( '========' );
      // console.log( 'expected:',expected );

      expect( actual ).to.deep.equal( expected );

    } );

  } );

  function _execConfigBlocks( angular1Module: any ) {
    const configBlocks = angular1Module._configBlocks;
    configBlocks.forEach( ( config )=> {
      const registeredFnArr = config[ 2 ];
      const fn = registeredFnArr[ 0 ];
      fn(angular1Module);
    } );
  }

  function _invokeQueueToCompare( invokeQueue: any, shouldSort = true ): [string,string,string] {

    const processedQueue = invokeQueue
      .map( ( queueItem: any ) => {
        return [ queueItem[ 0 ], queueItem[ 1 ], queueItem[ 2 ][ 0 ] ]
      } );
    return shouldSort
      ? processedQueue.sort( ( a, b )=>+(a[ 0 ] > b[ 0 ]) || +(a[ 0 ] === b[ 0 ]) - 1 )
      : processedQueue
  }

} );
