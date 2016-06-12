import * as sinon from 'sinon';
import { expect } from 'chai';
import { global } from '../../../src/facade/lang';
import { Component } from '../../../src/core/directives/decorators';
import { createNgModule } from '../../utils';
import { provide } from '../../../src/core/di';
import { bundle } from '../../../src/core/util/bundler';
import { Pipe } from '../../../src/core/pipes/decorators';
import { Injectable } from '../../../src/core/di/decorators';
import { OpaqueToken } from '../../../src/core/di/opaque_token';
import { Directive } from '../../../src/core/directives/decorators';

describe( `util/bundler`, () => {

  let sandbox: Sinon.SinonSandbox;
  beforeEach( () => {
    global.angular = createNgModule() as any;
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
      viewProviders: [ MyPrivateService ],
      pipes: [ UpsPipe ]
    } )
    class NestedComponent {
    }

    @Component( {
      selector: 'child-one',
      directives: [ NestedComponent ],
      providers: [ MyService, 'ui.bootstrap.modal' ],
      pipes: [ UpsPipe ],
      template: `hello Im childOne <nested></nested>`
    } )
    class ChildOneComponent {
    }

    const MyFactoryToken = new OpaqueToken( 'myFactory' );
    @Component( {
      selector: 'child-two',
      directives: [ NestedComponent ],
      providers: [ OtherService, MyService, { provide: MyFactoryToken, deps: [ '$q' ], useFactory: ( $q )=>({}) } ],
      pipes: [ UpsPipe ],
      template: `hello Im childTwo <nested></nested>`
    } )
    class ChildTwoComponent {
    }

    @Component( {
      selector: 'app',
      directives: [ ChildOneComponent, ChildTwoComponent ],
      providers: [ MySingleton, { provide: 'tokenAsClass', useClass: ViaProviderLiteralService } ],
      template: `Hello App
        <child-one></child-one>
        <child-two></child-two>
      `
    } )
    class AppComponent {
    }

    it( `should create module which has name as root component selector`, () => {

      const ngModule = bundle( AppComponent );

      expect( ngModule.name ).to.equal( 'app' );
      expect( ngModule.requires ).to.deep.equal( ['ui.bootstrap.modal'] );

    } );

    it( `should parse whole component tree and register all providers,viewProviders,pipes,directives`, () => {

      const thirdPartyModule = createNgModule().module( '3rdParty', [] ).name;
      const ngModule = bundle( AppComponent, [ SomeGlobalService, thirdPartyModule ] );

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
      const actualInvokeQueue = (ngModule as any)._invokeQueue;
      const actual = _invokeQueueToCompare( actualInvokeQueue, false );
      const expected = _invokeQueueToCompare( expectedInvokeQueue, false );

      // console.log( 'actual:',actual );
      // console.log( '========' );
      // console.log( 'expected:',expected );

      expect( actual ).to.deep.equal( expected );
      expect( ngModule.requires ).to.deep.equal( [ 'ui.bootstrap.modal','3rdParty' ] );

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
        directives: [ PluginFooDirectives, YoDirective ],
        providers: [ PluginFooProviders, MyPrivateService ],
        pipes: [ PluginFooPipes ]
      } )
      class AppWithPluginComponent {}

      const ngModule = bundle( AppWithPluginComponent );

      const expectedInvokeQueue = [
        [ '$compileProvider', 'directive', provide( AppWithPluginComponent ) ],
        [ '$provide', 'service', provide( MyService ) ],
        [ '$provide', 'service', provide( MySingleton ) ],
        [ '$provide', 'service', provide( MyPrivateService ) ],
        [ '$filterProvider', 'register', provide( UpsPipe ) ],
        [ '$compileProvider', 'directive', provide( NestedComponent ) ],
        [ '$compileProvider', 'directive', provide( YoDirective ) ]
      ];
      const actualInvokeQueue = (ngModule as any)._invokeQueue;
      const actual = _invokeQueueToCompare( actualInvokeQueue, false );
      const expected = _invokeQueueToCompare( expectedInvokeQueue, false );

      // console.log( 'actual:',actual );
      // console.log( '========' );
      // console.log( 'expected:',expected );

      expect( actual ).to.deep.equal( expected );

    } );

    it( `should allow ngModule.config within otherProviders setup`, () => {

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

      const ngModule = bundle( PureAppComponent, [ configPhase ] );

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

      const actualConfigBlocks = (ngModule as any)._configBlocks;
      const actualInvokeQueue = (ngModule as any)._invokeQueue;

      expect( actualConfigBlocks ).to.deep.equal( expectedConfigBlocks );

      _execConfigBlocks(ngModule);

      const actual = _invokeQueueToCompare( actualInvokeQueue, false );
      const expected = _invokeQueueToCompare( expectedInvokeQueue, false );

      // console.log( 'actual:',actual );
      // console.log( '========' );
      // console.log( 'expected:',expected );

      expect( actual ).to.deep.equal( expected );

    } );

  } );

  function _execConfigBlocks( ngModule: any ) {
    const configBlocks = ngModule._configBlocks;
    configBlocks.forEach( ( config )=> {
      const registeredFnArr = config[ 2 ];
      const fn = registeredFnArr[ 0 ];
      fn(ngModule);
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
