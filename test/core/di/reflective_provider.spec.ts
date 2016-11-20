import { expect } from 'chai';
import * as sinon from 'sinon';

import { global } from '../../../src/facade/lang';
import { Component, Directive } from '../../../src/core/directives/decorators';
import { Injectable, Inject } from '../../../src/core/di/decorators';
import { Pipe } from '../../../src/core/pipes/decorators';
import { _getAngular1ModuleMetadataByType, resolveReflectiveProvider } from '../../../src/core/di/reflective_provider';
import { createAngular1Module } from '../../utils';
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
    global.angular = createAngular1Module() as any;
  } );
  afterEach( () => {
    sandbox.restore();
  } );

  describe( `#resolveReflectiveProvider`, () => {

    it( `should throw error when no valid provider type is defined`, () => {

      const ValueToken = new OpaqueToken('helloToken');
      const providers = [
        createProvider( { provide: ValueToken, useValueee: 'hello' } as any ),
        createProvider( { provide: 'viaString', useValue: 'stringzzzz' } )
      ];

      expect(() => providers.map(resolveReflectiveProvider)).to.throw();

    } );

    it( `should resolve value by useValue and provide metadata for angular1Module`, () => {

      const ValueToken = new OpaqueToken('helloToken');
      const FalseToken = new OpaqueToken('helloFalse');
      const providers = [
        createProvider( { provide: ValueToken, useValue: 'hello' } ),
        createProvider( { provide: 'viaString', useValue: 'stringzzzz' } ),
        createProvider( { provide: FalseToken, useValue: false } ),
      ];

      const actual = providers.map(resolveReflectiveProvider);
      const expected = [
        { method: 'value', name: 'helloToken', value: 'hello' },
        { method: 'value', name: 'viaString', value: 'stringzzzz' },
        { method: 'value', name: 'helloFalse', value: false }
      ];

      expect( actual ).to.deep.equal( expected );

    } );
    it( `should resolve service by useClass and provide metadata for angular1Module`, () => {

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
    it( `should resolve factory by useFactory and provide metadata for angular1Module`, () => {

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
    it( `should resolve factory by useExisting and provide metadata for angular1Module`, () => {

      @Injectable()
      class SomeInjectable{}

      const provider = createProvider( { provide: 'foo', useExisting: SomeInjectable } );

      expect( ()=>resolveReflectiveProvider(provider) ).to.throw();

    } );

  } );
  describe( `#_normalizeProviders`, () => {

    let angular1Module: ng.IModule;
    beforeEach( () => {
      angular1Module = global.angular.module( 'myApp', [] );
    } );

    it( `should add dependant module to existing one if provider is string`, () => {
      const provider = 'ui.bootstrap.datepicker';
      const updatedAngular1Module = _normalizeProviders( angular1Module, [provider] );

      expect( updatedAngular1Module.requires ).to.deep.equal( [ 'ui.bootstrap.datepicker' ] );
    } );
    it( `should register $provide via value/service/factory if provider is ProviderLiteral`, () => {

      @Injectable()
      class HelloSvc{}

      const providers = [
        { provide: 'myValToken', useValue: 'lorem' },
        { provide: 'myHelloSvc', useClass: HelloSvc },
        { provide: 'myHelloFactory', useFactory: ()=>new HelloSvc() }
      ];
      const updatedAngular1Module = _normalizeProviders( angular1Module, providers );

      expect( _isTypeRegistered( 'myValToken', updatedAngular1Module, '$provide', 'value' ) ).to.equal( true );
      expect( _isTypeRegistered( 'myHelloSvc', updatedAngular1Module, '$provide', 'service' ) ).to.equal( true );
      expect( _isTypeRegistered( 'myHelloFactory', updatedAngular1Module, '$provide', 'factory' ) ).to.equal( true );

    } );
    it( `should register $provide via service if provider is Decorated Type`, () => {
      @Injectable()
      class HelloSvc{}

      const provider = HelloSvc;
      const updatedAngular1Module = _normalizeProviders( angular1Module, [provider] );

      expect( _isTypeRegistered( getInjectableName(HelloSvc), updatedAngular1Module, '$provide', 'service' ) ).to.equal( true );
    } );
    it( `should register $compileProvider via directive if provider is Decorated Type`, () => {

      @Directive( { selector: '[myFooAttr]' } )
      class HelloAttrDirective { }

      @Component( { selector: 'my-cmp', template: 'foo hello' } )
      class MyComponent { }

      const providers = [ HelloAttrDirective, MyComponent ];
      const updatedAngular1Module = _normalizeProviders( angular1Module, [ providers ] );

      expect( _isTypeRegistered(
        getInjectableName( HelloAttrDirective ),
        updatedAngular1Module,
        '$compileProvider',
        'directive'
      ) ).to.equal( true );

      expect( _isTypeRegistered(
        getInjectableName( MyComponent ),
        updatedAngular1Module,
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
      const updatedAngular1Module = _normalizeProviders( angular1Module, [provider] );

      expect( _isTypeRegistered(
        getInjectableName( UpsHelloPipe ),
        updatedAngular1Module,
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

      const updatedAngular1Module = _normalizeProviders( angular1Module, [ stateConfig, createProvider( {} ) as any ] ) as any;

      expect( updatedAngular1Module._configBlocks ).to.deep.equal(
        [
          [ '$injector', 'invoke', [ stateConfig ] ],
          [ '$injector', 'invoke', [ internalRef ] ]
        ]
      );

    } );
    it( `should throw if non supported provider type is used`, () => {
      expect( ()=>_normalizeProviders( angular1Module, [ 23213 ] as any ) ).to.throw();
      expect( ()=>_normalizeProviders( angular1Module, [ {} ] as any ) ).to.throw();
      expect( ()=>_normalizeProviders( angular1Module, [ true ] as any ) ).to.throw();
    } );

  } );
  describe( `#_isTypeRegistered`, () => {

    let angular1Module: ng.IModule;

    @Component({selector:'my-cmp',template:'fooo'})
    class MyCmp{}

    beforeEach( () => {
      angular1Module = global.angular.module( 'myApp', [] );
    } );

    it( `should check angular1Module for duplicates`, () => {

      let actual = _isTypeRegistered( 'myValue', angular1Module, '$provide', 'value' );

      expect( actual ).to.equal( false );

      angular1Module.value( ...provide( 'myValue', { useValue: 'hello' } ) );
      actual = _isTypeRegistered( 'myValue', angular1Module, '$provide', 'value' );

      expect( actual ).to.equal( true );

      actual = _isTypeRegistered( 'myCmp', angular1Module, '$compileProvider', 'directive' );

      expect( actual ).to.equal( false );

      angular1Module.directive( ...provide( MyCmp ) );
      actual = _isTypeRegistered( 'myCmp', angular1Module, '$compileProvider', 'directive' );

      expect( actual ).to.equal( true );

    } );

  } );
  describe(`#_getAngular1MetadataByType`, () => {

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

      expect( () => _getAngular1ModuleMetadataByType( Configure ) ).to.not.throw();
      expect( () => _getAngular1ModuleMetadataByType( configPhase ) ).to.not.throw();
      expect( () => _getAngular1ModuleMetadataByType( configFactory( {} ) ) ).to.not.throw();

      expect( _getAngular1ModuleMetadataByType( configPhase ) ).to.deep.equal( {
        providerName: '$injector',
        providerMethod: 'invoke',
        moduleMethod: 'config'
      } );

    });

    it(`should return angular1Module registration method by Type Metadata`, () => {
      const actual = [
        _getAngular1ModuleMetadataByType( FooComponent ),
        _getAngular1ModuleMetadataByType( FooDirective ),
        _getAngular1ModuleMetadataByType( MyService ),
        _getAngular1ModuleMetadataByType( UpsPipe ),
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

    let angular1Module: ng.IModule;

    beforeEach( () => {
      angular1Module = global.angular.module( 'myApp', [] );
    } );

    it( `should do nothing if Class doesn't have annotation`, () => {

      _registerTypeProvider( angular1Module, JustClass, { moduleMethod: 'service', name: '', value: noop } );
      expect( (angular1Module as any)._invokeQueue ).to.deep.equal( [] );

    } );
    it( `should register component/pipe/service via its name`, () => {

      sandbox.spy(angular1Module,'service');
      sandbox.spy(angular1Module,'filter');
      sandbox.spy(angular1Module,'directive');

      _registerTypeProvider( angular1Module, MyService, { moduleMethod: 'service', name: 'myService#1', value: noop } );
      _registerTypeProvider( angular1Module, UpsPipe, { moduleMethod: 'filter', name: 'ups', value: noop } );
      _registerTypeProvider( angular1Module, FooComponent, { moduleMethod: 'directive', name: 'foo', value: noop } );

      expect( (angular1Module.service as Sinon.SinonSpy).calledOnce ).to.equal( true );
      expect( (angular1Module.filter as Sinon.SinonSpy).calledOnce ).to.equal( true );
      expect( (angular1Module.directive as Sinon.SinonSpy).calledOnce ).to.equal( true );

    } );
    it( `should register directive via 3 types of template usage (name),[name],name`, () => {

      sandbox.spy( angular1Module, 'directive' );
      const spy = angular1Module.directive as Sinon.SinonSpy;

      _registerTypeProvider( angular1Module, FooDirective, { moduleMethod: 'directive', name: 'foo', value: noop } );

      expect( spy.calledThrice ).to.equal( true );
      expect( spy.calledWith( 'foo', noop ) ).to.equal( true );
      expect( spy.calledWith( '[foo]', noop ) ).to.equal( true );
      expect( spy.calledWith( '(foo)', noop ) ).to.equal( true );

    } );
  } );

} );
