import { expect } from 'chai';
import * as sinon from 'sinon';

import { global } from '../../../src/facade/lang';
import { Component, Directive } from '../../../src/core/directives/decorators';
import { Injectable, Inject } from '../../../src/core/di/decorators';
import { Pipe } from '../../../src/core/pipes/decorators';
import { _getNgModuleMetadataByType, resolveReflectiveProvider } from '../../../src/core/di/reflective_provider';
import { createNgModule } from '../../utils';
import { getInjectableName } from '../../../src/core/di/provider';
import { createProvider } from '../../../src/core/di/provider_util';
import { OpaqueToken } from '../../../src/core/di/opaque_token';
import { _isTypeRegistered } from '../../../src/core/di/reflective_provider';
import { provide } from '../../../src/core/di/provider';
import { _normalizeProviders } from '../../../src/core/di/reflective_provider';
import { _registerTypeProvider } from '../../../src/core/di/reflective_provider';
import { noop } from 'rxjs/util/noop';

describe( `di/reflective_provider`, () => {

  const sandbox = sinon.sandbox.create();

  beforeEach( () => {
    global.angular = createNgModule() as any;
  } );
  afterEach( () => {
    sandbox.restore();
  } );

  describe( `#resolveReflectiveProvider`, () => {

    it( `should resolve value by useValue and provide metadata for ngModule`, () => {

      const ValueToken = new OpaqueToken('helloToken');
      const providers = [
        createProvider( { provide: ValueToken, useValue: 'hello' } ),
        createProvider( { provide: 'viaString', useValue: 'stringzzzz' } ),
      ];

      const actual = providers.map(resolveReflectiveProvider);
      const expected = [
        { method: 'value', name: 'helloToken', value: 'hello' },
        { method: 'value', name: 'viaString', value: 'stringzzzz' }
      ];

      expect( actual ).to.deep.equal( expected );

    } );
    it( `should resolve service by useClass and provide metadata for ngModule`, () => {

      const classToken = new OpaqueToken('classToken');

      @Injectable()
      class SomeClass{}

      @Injectable()
      class SomeInjectable{}

      const providers = [
        createProvider( { provide: classToken, useClass: SomeClass } ),
        createProvider( { provide: 'byString', useClass: SomeClass } ),
        createProvider( { provide: SomeInjectable, useClass: SomeInjectable } )
      ];

      const actual = providers.map(resolveReflectiveProvider);
      const expected = [
        { method: 'service', name: 'classToken', value: SomeClass },
        { method: 'service', name: 'byString', value: SomeClass },
        { method: 'service', name: getInjectableName(SomeInjectable), value: SomeInjectable },
      ];

      expect( actual ).to.deep.equal( expected );

    } );
    it( `should resolve factory by useFactory and provide metadata for ngModule`, () => {

      const classToken = new OpaqueToken('classToken');

      @Injectable('$http')
      class Http{}

      @Injectable()
      class SomeClass{}

      @Injectable()
      class SomeInjectable{}

      class SomeLogger{
        constructor(private $log, private http){}
      }

      const factoryOne = ()=>new SomeClass();
      const factoryTwo = ( $log, http )=>new SomeLogger( $log, http );
      const factoryThree = ()=>()=>new SomeInjectable();

      const providers = [
        createProvider( { provide: classToken, useFactory: factoryOne } ),
        createProvider( { provide: 'byString', deps: [ '$log',Http ], useFactory: factoryTwo } ),
        createProvider( { provide: SomeInjectable, useFactory: factoryThree} )
      ];

      const actual = providers.map( resolveReflectiveProvider );
      const expected = [
        { method: 'factory', name: 'classToken', value: factoryOne },
        { method: 'factory', name: 'byString', value: factoryTwo },
        { method: 'factory', name: getInjectableName( SomeInjectable ), value: factoryThree }
      ];

      expect( actual ).to.deep.equal( expected );
      expect( actual[ 1 ].value.$inject ).to.deep.equal( [ '$log','$http' ] );

    } );
    it( `should resolve factory by useExisting and provide metadata for ngModule`, () => {

      @Injectable()
      class SomeInjectable{}

      const provider = createProvider( { provide: 'foo', useExisting: SomeInjectable } );

      expect( ()=>resolveReflectiveProvider(provider) ).to.throw();

    } );

  } );
  describe( `#_normalizeProviders`, () => {

    let ngModule: ng.IModule;
    beforeEach( () => {
      ngModule = global.angular.module( 'myApp', [] );
    } );

    it( `should add dependant module to existing one if provider is string`, () => {
      const provider = 'ui.bootstrap.datepicker';
      const updatedNgModule = _normalizeProviders( ngModule, [provider] );

      expect( updatedNgModule.requires ).to.deep.equal( [ 'ui.bootstrap.datepicker' ] );
    } );
    it( `should register $provide via value/service/factory if provider is ProviderLiteral`, () => {

      @Injectable()
      class HelloSvc{}

      const providers = [
        { provide: 'myValToken', useValue: 'lorem' },
        { provide: 'myHelloSvc', useClass: HelloSvc },
        { provide: 'myHelloFactory', useFactory: ()=>new HelloSvc() }
      ];
      const updatedNgModule = _normalizeProviders( ngModule, providers );

      expect( _isTypeRegistered( 'myValToken', updatedNgModule, '$provide', 'value' ) ).to.equal( true );
      expect( _isTypeRegistered( 'myHelloSvc', updatedNgModule, '$provide', 'service' ) ).to.equal( true );
      expect( _isTypeRegistered( 'myHelloFactory', updatedNgModule, '$provide', 'factory' ) ).to.equal( true );

    } );
    it( `should register $provide via service if provider is Decorated Type`, () => {
      @Injectable()
      class HelloSvc{}

      const provider = HelloSvc;
      const updatedNgModule = _normalizeProviders( ngModule, [provider] );

      expect( _isTypeRegistered( getInjectableName(HelloSvc), updatedNgModule, '$provide', 'service' ) ).to.equal( true );
    } );
    it( `should register $compileProvider via directive if provider is Decorated Type`, () => {

      @Directive( { selector: '[myFooAttr]' } )
      class HelloAttrDirective { }

      @Component( { selector: 'my-cmp', template: 'foo hello' } )
      class MyComponent { }

      const providers = [ HelloAttrDirective, MyComponent ];
      const updatedNgModule = _normalizeProviders( ngModule, [ providers ] );

      expect( _isTypeRegistered(
        getInjectableName( HelloAttrDirective ),
        updatedNgModule,
        '$compileProvider',
        'directive'
      ) ).to.equal( true );

      expect( _isTypeRegistered(
        getInjectableName( MyComponent ),
        updatedNgModule,
        '$compileProvider',
        'directive'
      ) ).to.equal( true );

    } );
    it( `should register $filterProvider via register if provider is Decorated Type`, () => {
      @Pipe( { name: 'upsHello' } )
      class UpsHelloPipe {
        transform( input ) { return input; }
      }

      const provider = UpsHelloPipe;
      const updatedNgModule = _normalizeProviders( ngModule, [provider] );

      expect( _isTypeRegistered(
        getInjectableName( UpsHelloPipe ),
        updatedNgModule,
        '$filterProvider',
        'register'
      ) ).to.equal( true );
    } );
    it( `should register config initializer if provider is class/function without Decorator`, () => {
      stateConfig.$inject = [ 'stateConfig' ];
      function stateConfig( $stateProvider ) {}

      let internalRef;
      function createProvider( initialValue ) {
        internalRef = ()=>({});
        return internalRef;
      }

      const updatedNgModule = _normalizeProviders( ngModule, [ stateConfig, createProvider( {} ) ] ) as any;

      expect( updatedNgModule._configBlocks ).to.deep.equal(
        [
          [ '$injector', 'invoke', [ stateConfig ] ],
          [ '$injector', 'invoke', [ internalRef ] ]
        ]
      );

    } );
    it( `should throw if non supported provider type is used`, () => {
      expect( ()=>_normalizeProviders( ngModule, [ 23213 ] as any ) ).to.throw();
      expect( ()=>_normalizeProviders( ngModule, [ {} ] as any ) ).to.throw();
      expect( ()=>_normalizeProviders( ngModule, [ true ] as any ) ).to.throw();
    } );

  } );
  describe( `#_isTypeRegistered`, () => {

    let ngModule: ng.IModule;

    @Component({selector:'my-cmp',template:'fooo'})
    class MyCmp{}

    beforeEach( () => {
      ngModule = global.angular.module( 'myApp', [] );
    } );

    it( `should check ngModule for duplicates`, () => {

      let actual = _isTypeRegistered( 'myValue', ngModule, '$provide', 'value' );

      expect( actual ).to.equal( false );

      ngModule.value( ...provide( 'myValue', { useValue: 'hello' } ) );
      actual = _isTypeRegistered( 'myValue', ngModule, '$provide', 'value' );

      expect( actual ).to.equal( true );

      actual = _isTypeRegistered( 'myCmp', ngModule, '$compileProvider', 'directive' );

      expect( actual ).to.equal( false );

      ngModule.directive( ...provide( MyCmp ) );
      actual = _isTypeRegistered( 'myCmp', ngModule, '$compileProvider', 'directive' );

      expect( actual ).to.equal( true );

    } );

  } );
  describe(`#_getNgModuleMetadataByType`, () => {

    @Component({selector:'foo',template:'hello'})
    class FooComponent{}

    @Directive({selector:'[fooAttr]'})
    class FooDirective{}

    @Injectable()
    class MyService{}

    @Pipe({name:'ups'})
    class UpsPipe{}

    it(`should not throw if type has no metadata, cause support of config function`, () => {
      class Configure {
        constructor( @Inject( '$provide' ) $provide: ng.auto.IProvideService ) {}
      }

      configPhase.$inject = ['$provide'];
      function configPhase($provide: ng.auto.IProvideService){}

      function configFactory( initState ) {
        return configPhase;
      }

      expect( () => _getNgModuleMetadataByType( Configure ) ).to.not.throw();
      expect( () => _getNgModuleMetadataByType( configPhase ) ).to.not.throw();
      expect( () => _getNgModuleMetadataByType( configFactory( {} ) ) ).to.not.throw();

      expect( _getNgModuleMetadataByType( configPhase ) ).to.deep.equal( {
        providerName: '$injector',
        providerMethod: 'invoke',
        moduleMethod: 'config'
      } );

    });

    it(`should return ngModule registration method by Type Metadata`, () => {
      const actual = [
        _getNgModuleMetadataByType( FooComponent ),
        _getNgModuleMetadataByType( FooDirective ),
        _getNgModuleMetadataByType( MyService ),
        _getNgModuleMetadataByType( UpsPipe ),
      ];
      const expected = [
        { providerName: '$compileProvider', providerMethod: 'directive', moduleMethod: 'directive' },
        { providerName: '$compileProvider', providerMethod: 'directive', moduleMethod: 'directive' },
        { providerName: '$provide', providerMethod: 'service', moduleMethod: 'service' },
        { providerName: '$filterProvider', providerMethod: 'register', moduleMethod: 'filter' },
      ];

      expect( actual ).to.deep.equal( expected );
    });

  });
  describe( `#_registerTypeProvider`, () => {

    @Component({selector:'foo',template:'hello'})
    class FooComponent{}

    @Directive({selector:'[fooAttr]'})
    class FooDirective{}

    @Injectable()
    class MyService{}

    @Pipe({name:'ups'})
    class UpsPipe{}

    class JustClass{}

    let ngModule: ng.IModule;

    beforeEach( () => {
      ngModule = global.angular.module( 'myApp', [] );
    } );

    it( `should do nothing if Class doesn't have annotation`, () => {

      _registerTypeProvider( ngModule, JustClass, { moduleMethod: 'service', name: '', value: noop } );
      expect( (ngModule as any)._invokeQueue ).to.deep.equal( [] );

    } );
    it( `should register component/pipe/service via its name`, () => {

      sandbox.spy(ngModule,'service');
      sandbox.spy(ngModule,'filter');
      sandbox.spy(ngModule,'directive');

      _registerTypeProvider( ngModule, MyService, { moduleMethod: 'service', name: 'myService#1', value: noop } );
      _registerTypeProvider( ngModule, UpsPipe, { moduleMethod: 'filter', name: 'ups', value: noop } );
      _registerTypeProvider( ngModule, FooComponent, { moduleMethod: 'directive', name: 'foo', value: noop } );

      expect( (ngModule.service as Sinon.SinonSpy).calledOnce ).to.equal( true );
      expect( (ngModule.filter as Sinon.SinonSpy).calledOnce ).to.equal( true );
      expect( (ngModule.directive as Sinon.SinonSpy).calledOnce ).to.equal( true );

    } );
    it( `should register directive via 3 types of template usage (name),[name],name`, () => {

      sandbox.spy( ngModule, 'directive' );
      const spy = ngModule.directive as Sinon.SinonSpy;

      _registerTypeProvider( ngModule, FooDirective, { moduleMethod: 'directive', name: 'foo', value: noop } );

      expect( spy.calledThrice ).to.equal( true );
      expect( spy.calledWith( 'foo', noop ) ).to.equal( true );
      expect( spy.calledWith( '[foo]', noop ) ).to.equal( true );
      expect( spy.calledWith( '(foo)', noop ) ).to.equal( true );

    } );
  } );

} );
