import {expect} from 'chai';
import {
  Inject,
  Host,
  Injectable,
  Optional,
  Self,
  SkipSelf
} from '../../src/di/decorators';
import {
  InjectMetadata,
  HostMetadata,
  InjectableMetadata,
  OptionalMetadata,
  SelfMetadata,
  SkipSelfMetadata
} from '../../src/di/metadata';
import { reflector } from '../../src/reflection/reflection';
import {isArray,isBlank,isPresent} from '../../src/facade/lang'

describe( 'di/decorators', () => {

  describe( 'Class decorators', () => {

    it( 'should create annotation metadata on class', () => {

      @Injectable()
      class Test {
      }

      expect( Array.isArray( reflector.annotations( Test ) ) ).to.equal( true );

    } );

  } );

  describe( 'Parameter decorators', () => {

    let cls: any;

    beforeEach( () => {

      class Test {
        constructor(
          @Inject( '$log' ) private $log,
          @Host() @Inject( 'ngModel' ) private ngModel
        ) {}
      }

      cls = Test;

    } );
    it( 'should create param metadata on class', () => {

      expect( Array.isArray( reflector.parameters(cls) ) ).to.equal( true );

    } );
    it( 'should create 2 dimensional param metadata', () => {

      const [paramOne,paramTwo] = reflector.parameters(cls);

      expect( reflector.parameters(cls).length ).to.equal( 2 );
      expect( paramOne.length ).to.equal( 1 );
      expect( paramTwo.length ).to.equal( 2 );

    } );
    it( 'should put to proper indexes proper paramDecorator instance', () => {

      const [paramOne,paramTwo] = reflector.parameters(cls);

      expect( paramOne[ 0 ] instanceof InjectMetadata ).to.equal( true );
      expect( paramTwo[ 0 ] instanceof InjectMetadata ).to.equal( true );
      expect( paramTwo[ 1 ] instanceof HostMetadata ).to.equal( true );

    } );

  } );

  describe( 'param decorators used on non constructor(@Inject)', () => {

    let cls: any;

    beforeEach( () => {

      class TestProvider {

        static $compile(
          @Inject( '$template' ) $template
        ){}

        $get(
          @Inject( '$log' ) $log,
          @Inject( 'foo' ) foo
        ) {}

      }

      cls = TestProvider;

    } );

    it( 'should not add instance to PARAM_META_KEY if used on non constructor', () => {

      expect( reflector.parameters( cls ) ).to.deep.equal( [] );

    } );

    it( 'should immediately add $inject with proper annotations on method', () => {

      expect( isArray( cls.prototype.$get.$inject ) ).to.equal( true );
      expect( cls.prototype.$get.$inject ).to.deep.equal( [ '$log', 'foo' ] );

    } );

    it( 'should immediately add $inject with proper annotations on static method', () => {

      expect( isArray( cls.$compile.$inject ) ).to.equal( true );
      expect( cls.$compile.$inject ).to.deep.equal( [ '$template' ] );

    } );

    it( `should work for both constructor and method within a class`, ()=> {

      class TestBothInjectProvider {

        static $compile(
          @Inject( '$template' ) $template
        ){}

        constructor(
          @Inject('$http') private $http
        ){}

        $get(
          @Inject( '$log' ) $log,
          @Inject( 'foo' ) foo
        ) {}

      }

      const cls = TestBothInjectProvider;

      expect( isBlank( reflector.parameters(cls) ) ).to.equal( false );
      expect( reflector.parameters(cls)[0][0] instanceof InjectMetadata ).to.equal( true );
      expect( isBlank( cls.$inject ) ).to.equal( true );

      expect( isArray( cls.prototype.$get.$inject ) ).to.equal( true );
      expect( cls.prototype.$get.$inject ).to.deep.equal( [ '$log', 'foo' ] );

      expect( isArray( cls.$compile.$inject ) ).to.equal( true );
      expect( cls.$compile.$inject ).to.deep.equal( [ '$template' ] );


    } );

  } );


} );
