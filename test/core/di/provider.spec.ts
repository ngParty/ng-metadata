import { expect } from 'chai';
import {
  provide,
  _areAllDirectiveInjectionsAtTail,
  getInjectableName,
  _extractToken,
  _dependenciesFor,
  ParamMetaInst
} from '../../../src/core/di/provider';
import { Inject, Injectable, Host } from '../../../src/core/di/decorators';
import { InjectMetadata, OptionalMetadata, HostMetadata } from '../../../src/core/di/metadata';
import { Component, Directive } from '../../../src/core/directives/decorators';
import { Pipe } from '../../../src/core/pipes/decorators';
import { noop, isFunction, getFuncName } from '../../../src/facade/lang';
import { OpaqueToken } from '../../../src/core/di/opaque_token';
import { globalKeyRegistry } from '../../../src/core/di/key';
import { NgForm } from '../../../src/common/directives/ng_form';
import { NgModel } from '../../../src/common/directives/ng_model';

describe( `di/provider`, ()=> {

  beforeEach( ()=> {

    globalKeyRegistry._reset();

  } );

  describe( `#provide`, ()=> {

    it( `should allow registration of ng.constant and ng.value via string and useValue`, ()=> {

      const MY_CONST = { foo: 123 };
      const actual = provide( 'myConst', { useValue: MY_CONST } );
      const expected = [ 'myConst', { foo: 123 } ];

      expect( actual ).to.deep.equal( expected );

    } );

    it( `should allow registration of ng.constant and ng.value via OpaqueToken and useValue`, ()=> {

      const MY_CONST_VALUE = { foo: 123 };
      const MY_CONST = new OpaqueToken( 'myConst' );

      const actual = provide( MY_CONST, { useValue: MY_CONST_VALUE } );
      const expected = [ 'myConst', { foo: 123 } ];

      expect( actual ).to.deep.equal( expected );

    } );

    it( `should return token name and Ctor for Angular registry and add $inject prop if needed (string)`, ()=> {

      @Injectable()
      class Foo {
        constructor( @Inject( '$http' ) private $http ) {}
      }
      const actual = provide( 'fooToken', { useClass: Foo } );
      const expected = [ 'fooToken', Foo ];

      expect( actual ).to.deep.equal( expected );
      expect( Foo.$inject ).to.deep.equal( [ '$http' ] );

    } );
    it( `should return string name and Ctor for Angular registry and add $inject prop if needed (Class)`, ()=> {

      @Injectable()
      class MyService {
      }

      @Injectable()
      class Foo {
        constructor( @Inject( MyService ) private mySvc ) {}
      }
      const actual = provide( Foo );
      const expected = [ 'foo#2', Foo ];

      expect( actual ).to.deep.equal( expected );
      expect( Foo.$inject ).to.deep.equal( [ 'myService#1' ] );

    } );
    it( `should skip generating Injectable token if explicitly provided and add $inject prop if needed (Class)`, ()=> {
      @Injectable('mySuperSvc')
      class MyService {
      }

      @Injectable('myFooSvc')
      class Foo {
        constructor( @Inject( MyService ) private mySvc ) {}
      }
      const actual = provide( Foo );
      const expected = [ 'myFooSvc', Foo ];

      expect( actual ).to.deep.equal( expected );
      expect( Foo.$inject ).to.deep.equal( [ 'mySuperSvc' ] );
    });
    it( `should return string name and filter factory for Angular registry and add $inject prop if needed (Pipe)`,
      ()=> {

        @Injectable()
        class MyService {
        }

        @Pipe( { name: 'fooYo' } )
        class FooPipe {
          constructor( @Inject( MyService ) private mySvc ) {}

          transform( value: any ) {}
        }

        const actual = provide( FooPipe );
        const [ngContainerName, filterFactory] = actual;

        expect( ngContainerName ).to.deep.equal( 'fooYo' );
        expect( isFunction( filterFactory ) ).to.deep.equal( true );
        expect( FooPipe.$inject ).to.deep.equal( [ 'myService#1' ] );

      } );

    it( `should return string name and directiveFactory for Angular registry and add $inject prop if needed (Directive)`,
      ()=> {

        @Injectable()
        class MyService {
        }

        @Directive( {
          selector: '[my-foo]'
        } )
        class FooDirective {
          constructor( @Inject( MyService ) private mySvc ) {}
        }

        const actual = provide( FooDirective ) as [string,Function];
        const [ngContainerName, filterFactory] = actual;

        expect( ngContainerName ).to.deep.equal( 'myFoo' );
        expect( isFunction( filterFactory ) ).to.deep.equal( true );

        expect( FooDirective.$inject ).to.deep.equal( [ 'myService#1' ] );
        expect( getFuncName(filterFactory().controller) ).to.equal( '_controller' );

      } );

    it( `should return string name and directiveFactory for Angular registry and add $inject prop if needed (Component)`,
      ()=> {

        @Injectable()
        class MyService {
        }

        @Component( {
          selector: 'my-foo',
          template: `hello`
        } )
        class FooComponent {
          constructor(
            @Inject( MyService ) private mySvc,
            @Inject( '$element' ) private $element
          ) {}
        }

        const actual = provide( FooComponent );
        const [ngContainerName, filterFactory] = actual as [string, Function];

        expect( FooComponent.$inject ).to.deep.equal( [ 'myService#1', '$element' ] );

        expect( ngContainerName ).to.equal( 'myFoo' );
        expect( isFunction( filterFactory ) ).to.equal( true );
        expect( getFuncName( filterFactory().controller ) ).to.equal( '_controller' );

      } );

  } );

  describe( `provide:errors`, ()=> {

    it( `should throw if registering ng.constant/value via Opaque token and useValue is blank`, ()=> {

      const MY_CONST = new OpaqueToken( 'myConst' );

      expect( ()=>provide( MY_CONST ) ).to.throw();
      expect( ()=>provide( MY_CONST, { useValue: undefined } ) ).to.throw();

    } );

    it( `should throw if registering type as service which is not a Class`, ()=> {

      expect( ()=>provide( 'foo' ) ).to.throw();
      expect( ()=>(provide as any)( 1231 ) ).to.throw();
      expect( ()=>(provide as any)( { hello: 'wat' } ) ).to.throw();

    } );
    it( `should not throw if registering class or function, cause they are supposed to be config functions`, ()=> {

      class MyService {
        constructor( @Inject( '$log' ) private $log ) {}
      }

      expect( ()=>provide( MyService ) ).to.not.throw();

    } );
    it( `should throw if class has more than 1 class decorator and those are two aren't @Component and @StateConfig`,
      ()=> {

        @Component( { selector: 'my-foo', template:'foo' } )
        @Injectable()
        class WrongComponent {
        }
        expect( ()=>provide( WrongComponent ) ).to.throw();

        @Directive( { selector: '[my-attr]' } )
        @Injectable()
        class WrongDirective {
        }

        expect( ()=>provide( WrongDirective ) ).to.throw();

        @Pipe({name:'somePipe'})
        @Injectable()
        class WrongPipe{}

        expect( ()=>provide( WrongPipe ) ).to.throw();

        @Pipe({name:'somePipe'})
        @Directive({selector:'[some-ppp]'})
        class StopDrinkingDude{}

        expect( ()=>provide( StopDrinkingDude ) ).to.throw();

      } );

  } );

  describe( `#getInjectableName`, ()=> {

    it( `should return string if injectable is string for @Inject(token)`, ()=> {

      const actual = getInjectableName( '$http' );
      const expected = '$http';

      expect( actual ).to.equal( expected );

    } );
    it( `should return string if injectable is OpaqueToken for @Inject(token)`, ()=> {

      const token = new OpaqueToken( 'MY_CONSTANTS' );
      const actual = getInjectableName( token );
      const expected = 'MY_CONSTANTS';

      expect( actual ).to.equal( expected );

    } );
    it( `should throw trying to get injectable from pure class for @Inject(token)`, ()=> {

      class Service {}

      expect( ()=>getInjectableName( Service ) ).to.throw();

    } );
    it( `should return string if injectable is @Injectable() for @Inject(token)`, ()=> {

      @Injectable()
      class MyNewService {
      }

      const actual = getInjectableName( MyNewService );
      const expected = 'myNewService#1';

      expect( actual ).to.equal( expected );

    } );
    it( `should return string if injectable is @Directive() for @Inject(token)`, ()=> {

      @Directive( { selector: '[myFoo]' } )
      class MyFooDirective {
      }

      const actual = getInjectableName( MyFooDirective );
      const expected = 'myFoo';

      expect( actual ).to.equal( expected );

    } );
    it( `should return string if injectable is @Pipe() for @Inject(token)`, ()=> {

      @Pipe( { name: 'ngUppercase' } )
      class UppercasePipe {
      }

      const actual = getInjectableName( UppercasePipe );
      const expected = 'ngUppercase';

      expect( actual ).to.equal( expected );

    } );

  } );

  describe( `private API`, ()=> {

    describe( `#_areDirectiveInjectionsNoAtTail`, ()=> {

      it( `should return true if all directive injections are at tail`, ()=> {

        let metadata = [ [ noop ], [ noop, noop ] ];
        let actual = _areAllDirectiveInjectionsAtTail( metadata as ParamMetaInst[][] );
        let expected = true;

        expect( actual ).to.equal( expected );

        metadata = [ [ noop ], [ noop ], [ noop, noop ], [ noop, noop ] ];
        actual = _areAllDirectiveInjectionsAtTail( metadata as ParamMetaInst[][] );
        expected = true;

        expect( actual ).to.equal( expected );


        metadata = [ [ noop ] ];
        actual = _areAllDirectiveInjectionsAtTail( metadata as ParamMetaInst[][] );
        expected = true;

        expect( actual ).to.equal( expected );


        metadata = [ [ noop, noop ] ];
        actual = _areAllDirectiveInjectionsAtTail( metadata as ParamMetaInst[][] );
        expected = true;

        expect( actual ).to.equal( expected );


        metadata = [ [] ];
        actual = _areAllDirectiveInjectionsAtTail( metadata as ParamMetaInst[][] );
        expected = true;

        expect( actual ).to.equal( expected );

      } );
      it( `should return false if directive injections are mixed in argument positions and not at tail`, ()=> {

        let metadata = [ [ noop ], [ noop, noop ], [ noop ] ];
        let actual = _areAllDirectiveInjectionsAtTail( metadata as ParamMetaInst[][] );
        let expected = true;

        expect( actual ).to.equal( false );

        metadata = [ [ noop, noop ], [ noop ], [ noop ], [ noop, noop ] ];
        actual = _areAllDirectiveInjectionsAtTail( metadata as ParamMetaInst[][] );
        expected = false;

        expect( actual ).to.equal( expected );


        metadata = [ [ noop, noop ], [ noop ] ];
        actual = _areAllDirectiveInjectionsAtTail( metadata as ParamMetaInst[][] );
        expected = false;

        expect( actual ).to.equal( expected );


        metadata = [ [ noop, noop ], [ noop ], [ noop ] ];
        actual = _areAllDirectiveInjectionsAtTail( metadata as ParamMetaInst[][] );
        expected = false;

        expect( actual ).to.equal( expected );

      } );

    } );

    describe( `#_extractToken`, ()=> {

      it( `should extract string token from provided Inject parameter metadata`, ()=> {

        const metadata = [ new InjectMetadata( 'foo' ), new OptionalMetadata(), new HostMetadata() ];
        const actual = _extractToken( metadata );
        const expected = 'foo';

        expect( actual ).to.equal( expected );

      } );

      it( `should return undefined if there is no Inject parameter metadata`, ()=> {

        const metadata = [ new OptionalMetadata(), new HostMetadata() ];
        const actual = _extractToken( metadata );
        const expected = undefined;

        expect( actual ).to.equal( expected );

      } );

    } );

    describe( `#_dependenciesFor`, ()=> {

      it( `should return empty array if there are no constructor Injection params`, ()=> {

        class Foo {}

        expect( _dependenciesFor( Foo ) ).to.deep.equal( [] );

        class HelloProvider {
          $get( @Inject( '$httpProvider' ) $httpProvider ) {}
        }

        expect( _dependenciesFor( HelloProvider ) ).to.deep.equal( [] );

      } );

      it( `should throw if there are holes in constructor meta params`, ()=> {

        class Foo {
          constructor(
            @Inject( '$log' ) $log,
            @Inject( 'someSvc' ) someSvc,
            iAmEvilHole,
            @Inject( 'ohMy' ) ohMy
          ) {}
        }

        expect( ()=>_dependenciesFor( Foo ) ).to.throw();

      } );

      it( `should allow directive injections in arbitrary argument position`, ()=> {

        class Foo {
          constructor(
            @Inject( '$log' ) $log,
            @Inject( 'someSvc' ) someSvc,
            @Inject( 'ngModel' ) @Host() ngModel,
            @Inject( 'ohMy' ) ohMy
          ) {}
        }

        expect( ()=>_dependenciesFor( Foo ) ).to.not.throw();

      } );

      it( `should return array of string annotations with Directive injections included as locals, for Angular 1 $inject`, ()=> {

        const OhMy = new OpaqueToken( 'oh_My' );

        @Injectable()
        class SvcYo {}

        @Injectable()
        class SvcSecondBo {}

        @Directive( { selector: '[myMyDrr]' } )
        class MyFooDirective {}

        @Directive( { selector: '[mySecondDrr]' } )
        class MySecondDirective {}

        @Injectable()
        class Foo {
          constructor(
            @Inject( '$log' ) $log,
            @Inject( SvcYo ) someSvc: SvcYo,
            someSecondSvc: SvcSecondBo,
            @Inject( OhMy ) ohMy: typeof OhMy,
            @Inject( 'ngModel' ) @Host() ngModel: NgModel,
            @Host() ngForm: NgForm,
            @Inject( MyFooDirective ) @Host() myDirective: MyFooDirective,
            @Host() mySecond: MySecondDirective
          ) {}
        }

        const actual = _dependenciesFor( Foo );
        const expected = [
          '$log',
          'svcYo#1',
          'svcSecondBo#2',
          'oh_My',
          'ngModel',
          'form',
          'myMyDrr',
          'mySecondDrr'
        ];

        expect( actual ).to.deep.equal( expected );

      } );

    } );

  } );

} );
