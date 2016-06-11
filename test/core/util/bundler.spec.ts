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

describe( `util/bundler`, () => {

  let sandbox: Sinon.SinonSandbox;
  global.angular = createNgModule() as any;
  beforeEach( () => {
    sandbox = sinon.sandbox.create();
  } );
  beforeEach( () => {


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

      // console.log( actual );
      // console.log( '========' );
      // console.log( expected );

      expect( actual ).to.deep.equal( expected );
      expect( ngModule.requires ).to.deep.equal( [ 'ui.bootstrap.modal','3rdParty' ] );

    } );

  } );

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
