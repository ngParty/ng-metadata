import {expect} from 'chai';
import {provide} from '../../../src/core/di/provider';
import {Inject,Injectable} from '../../../src/core/di/decorators';
import {InjectMetadata,OptionalMetadata,HostMetadata} from '../../../src/core/di/metadata';
import {Component,Directive} from '../../../src/core/directives/decorators';
import {Pipe} from '../../../src/core/pipes/decorators'
import {noop} from '../../../src/facade/lang';
import {_areAllDirectiveInjectionsAtTail} from '../../../src/core/di/provider';
import {_getTokenStringFromInjectable} from '../../../src/core/di/provider';
import {OpaqueToken} from '../../../src/core/di/opaque_token';
import {_extractToken} from '../../../src/core/di/provider';
import {_dependenciesFor} from '../../../src/core/di/provider';
import {Host} from '../../../src/core/di/decorators';
import {isFunction} from '../../../src/facade/lang';
import {ParamMetaInst} from '../../../src/core/di/provider';

describe( `di/provider`, ()=> {

  describe( `provide`, ()=> {

    it( `should allow registration of ng.constant and ng.value via string and useValue`, ()=> {

      const MY_CONST = { foo: 123 };
      const actual = provide( 'myConst', { useValue: MY_CONST } );
      const expected = [ 'myConst', { foo: 123 } ];

      expect( actual ).to.deep.equal( expected );

    } );

    it( `should allow registration of ng.constant and ng.value via OpaqueToken and useValue`, ()=> {

      const MY_CONST_VALUE = { foo: 123 };
      const MY_CONST = new OpaqueToken('myConst');

      const actual = provide( MY_CONST, { useValue: MY_CONST_VALUE } );
      const expected = [ 'myConst', { foo: 123 } ];

      expect( actual ).to.deep.equal( expected );

    } );

    it( `should return token name and Ctor for Angular registry and add $inject prop if needed (string)`, ()=> {

      @Injectable()
      class Foo{
        constructor(@Inject('$http') private $http){}
      }
      const actual = provide( 'fooToken', { useClass: Foo } );
      const expected = [ 'fooToken', Foo ];

      expect(actual).to.deep.equal(expected);
      expect(Foo.$inject).to.deep.equal(['$http']);

    } );
    it( `should return string name and Ctor for Angular registry and add $inject prop if needed (Class)`, ()=> {

      class MyService {}

      @Injectable()
      class Foo {
        constructor( @Inject( MyService ) private mySvc ) {}
      }
      const actual = provide( Foo );
      const expected = [ 'foo', Foo ];

      expect(actual).to.deep.equal(expected);
      expect( Foo.$inject ).to.deep.equal( [ 'myService' ] );

    } );
    it( `should return string name and filter factory for Angular registry and add $inject prop if needed (Pipe)`, ()=> {

      class MyService{}

      @Pipe({ name: 'fooYo' } )
      class FooPipe{
        constructor(@Inject(MyService) private mySvc){}
        transform(value:any){}
      }

      const actual = provide( FooPipe );
      const [ngContainerName, filterFactory] = actual;

      expect( ngContainerName ).to.deep.equal( 'fooYo' );
      expect( isFunction( filterFactory ) ).to.deep.equal( true );
      expect( FooPipe.$inject ).to.deep.equal( [ 'myService' ] );

    } );
    it( `should return string name and directiveFactory for Angular registry and add $inject prop if needed (Directive)`, ()=> {

      class MyService{}

      @Directive({
        selector: '[my-foo]'
      })
      class FooDirective{
        constructor(@Inject(MyService) private mySvc){}
      }

      const actual = provide(FooDirective);
      const [ngContainerName, filterFactory] = actual;

      expect( ngContainerName ).to.deep.equal( 'myFoo' );
      expect( isFunction( filterFactory ) ).to.deep.equal( true );
      expect(FooDirective.$inject).to.deep.equal(['myService']);

    } );
    it( `should return string name and directiveFactory for Angular registry and add $inject prop if needed (Component)`, ()=> {

      class MyService{}

      @Component({
        selector: 'my-foo',
        template:`hello`
      })
      class FooComponent{
        constructor(@Inject(MyService) private mySvc,@Inject('$element') private $element){}
      }

      const actual = provide(FooComponent);
      const [ngContainerName, filterFactory] = actual;

      expect( ngContainerName ).to.deep.equal( 'myFoo' );
      expect( isFunction( filterFactory ) ).to.deep.equal( true );

      expect(FooComponent.$inject).to.deep.equal(['myService','$element']);

    } );

  } );

  describe( `private API`, ()=> {

    describe( `#_getTokenStringFromInjectable`, ()=> {

      it( `should return string if injectable is string for @Inject(token)`, ()=> {

        const actual = _getTokenStringFromInjectable('$http');
        const expected = '$http';

        expect( actual ).to.equal( expected );

      } );
      it( `should return string if injectable is OpaqueToken for @Inject(token)`, ()=> {

        const token = new OpaqueToken('MY_CONSTANTS');
        const actual = _getTokenStringFromInjectable(token);
        const expected = 'MY_CONSTANTS';

        expect( actual ).to.equal( expected );

      } );
      it( `should return string if injectable is pure class for @Inject(token)`, ()=> {

        class Service{}

        const actual = _getTokenStringFromInjectable(Service);
        const expected = 'service';

        expect( actual ).to.equal( expected );

      } );
      it( `should return string if injectable is @Injectable() for @Inject(token)`, ()=> {

        @Injectable()
        class MyNewService{}

        const actual = _getTokenStringFromInjectable(MyNewService);
        const expected = 'myNewService';

        expect( actual ).to.equal( expected );

      } );
      it( `should return string if injectable is @Directive() for @Inject(token)`, ()=> {

        @Directive({selector:'[myFoo]'})
        class MyFooDirective{}

        const actual = _getTokenStringFromInjectable(MyFooDirective);
        const expected = 'myFoo';

        expect( actual ).to.equal( expected );

      } );
      it( `should return string if injectable is @Pipe() for @Inject(token)`, ()=> {

        @Pipe({name:'ngUppercase'})
        class UppercasePipe{}

        const actual = _getTokenStringFromInjectable(UppercasePipe);
        const expected = 'ngUppercase';

        expect( actual ).to.equal( expected );

      } );

    } );

    describe( `#_areDirectiveInjectionsNoAtTail`, ()=> {

      it( `should return true if all directive injections are at tail`, ()=> {

        let metadata = [[noop],[noop,noop]];
        let actual = _areAllDirectiveInjectionsAtTail(metadata as ParamMetaInst[][]);
        let expected = true;

        expect( actual ).to.equal( expected );

        metadata = [[noop],[noop],[noop,noop],[noop,noop]];
        actual = _areAllDirectiveInjectionsAtTail(metadata as ParamMetaInst[][]);
        expected = true;

        expect( actual ).to.equal( expected );


        metadata = [[noop]];
        actual = _areAllDirectiveInjectionsAtTail(metadata as ParamMetaInst[][]);
        expected = true;

        expect( actual ).to.equal( expected );


        metadata = [[noop,noop]];
        actual = _areAllDirectiveInjectionsAtTail(metadata as ParamMetaInst[][]);
        expected = true;

        expect( actual ).to.equal( expected );


        metadata = [[]];
        actual = _areAllDirectiveInjectionsAtTail(metadata as ParamMetaInst[][]);
        expected = true;

        expect( actual ).to.equal( expected );

      } );
      it( `should return false if directive injections are mixed in argument positions and not at tail`, ()=> {

        let metadata = [[noop],[noop,noop],[noop]];
        let actual = _areAllDirectiveInjectionsAtTail(metadata as ParamMetaInst[][]);
        let expected = true;

        expect( actual ).to.equal( false );

        metadata = [ [ noop, noop ], [ noop ], [ noop ], [ noop, noop ] ];
        actual = _areAllDirectiveInjectionsAtTail(metadata as ParamMetaInst[][]);
        expected = false;

        expect( actual ).to.equal( expected );


        metadata = [[noop,noop],[noop]];
        actual = _areAllDirectiveInjectionsAtTail(metadata as ParamMetaInst[][]);
        expected = false;

        expect( actual ).to.equal( expected );


        metadata = [[noop,noop],[noop],[noop]];
        actual = _areAllDirectiveInjectionsAtTail(metadata as ParamMetaInst[][]);
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

        class Foo{}

        expect( _dependenciesFor( Foo ) ).to.deep.equal( [] );

        class HelloProvider{
          $get(@Inject('$httpProvider') $httpProvider){}
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
      it( `should throw if directive injections are not all at tail`, ()=> {

        class Foo {
          constructor(
            @Inject( '$log' ) $log,
            @Inject( 'someSvc' ) someSvc,
            @Inject('ngModel') @Host() ngModel,
            @Inject( 'ohMy' ) ohMy
          ) {}
        }

        expect( ()=>_dependenciesFor( Foo ) ).to.throw();

      } );

      it( `should return array of string annotations from non Directive injections only, for Angular 1 $inject`, ()=> {

        const OhMy = new OpaqueToken('oh_My');

        @Injectable()
        class SvcYo{}

        @Directive({selector:'[myMyDrr]'})
        class MyFooDirective{}

        class Foo {
          constructor(
            @Inject( '$log' ) $log,
            @Inject( SvcYo ) someSvc,
            @Inject( OhMy ) ohMy,
            @Inject('ngModel') @Host() ngModel,
            @Inject(MyFooDirective) @Host() myDirective
          ) {}
        }

        const actual = _dependenciesFor(Foo);
        const expected = ['$log','svcYo', 'oh_My'];

        expect( actual ).to.deep.equal( expected );

      } );

    } );

  } );

} );
