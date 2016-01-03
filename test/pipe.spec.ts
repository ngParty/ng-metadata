import {expect} from 'chai';
import {Inject} from '../src/inject';
import {Pipe,makePipe,isPipe} from '../src/pipe';

describe( '@Pipe', function () {

  describe( 'API', function () {

    it( 'should throw error when name is missing', function () {

      function _willThrow() {
        @Pipe()
        class UppercasePipe {
        }
      }

      expect( _willThrow ).to.throw( `@Pipe: must have 'name' property` );

    } );
    it( 'should throw error when class doesnt implements transform method', function () {

      function _willThrow() {

        @Pipe( { name: 'uppercase' } )
        class UppercasePipe {
        }

      }

      expect( _willThrow ).to.throw( `@Pipe: must implement '#transform' method` );

    } );
    it( 'should throw error when not explicitly set pure=false and using DI', function () {

      function _willThrow() {

        @Pipe( { name: 'uppercase' } )
        class UppercasePipe {
          constructor( @Inject( 'foo' ) private foo: any ) {}

          transform( input: string ) {
            return input.toUpperCase();
          }

        }

      }

      expect( _willThrow ).to.throw( `@Pipe: you provided Injectables but didn't specified pure:false` );

    } );

  } );
  describe( 'Metadata', function () {

    it( 'should create pipeName and pipePure as static properties on class', function () {

      @Pipe( { name: 'uppercase' } )
      class UppercasePipe {

        transform( input: string ) {
          return input.toUpperCase();
        }

      }
      const {pipeName,pipePure} = UppercasePipe as any;

      expect(pipeName).to.equal('uppercase');
      expect(pipePure).to.equal(true);

    } );

  } );
  describe( '#makePipe', function () {

    let PipeClass;
    let $injector = {
      instantiate(classFactory){
        return new classFactory();
      }
    } as ng.auto.IInjectorService;

    beforeEach( function () {

      @Pipe( { name: 'uppercase' } )
      class UppercasePipe {

        transform( input: string ) {
          return input.toUpperCase();
        }

      }

      PipeClass = UppercasePipe;

    } );

    it( 'should create angular.filter from pipe ', function () {

      const ngFilterFactory = makePipe( PipeClass );
      expect( typeof ngFilterFactory ).to.equal( 'function' );

      const ngFilter = ngFilterFactory($injector);
      expect(ngFilter('foo')).to.equal('FOO');

    } );

  } );
  describe( 'Helpers', function () {

    it( 'should determine that Type is Pipe when it has pipeName property', function () {

      @Pipe( { name: 'uppercase' } )
      class UppercasePipe {

        transform( input: string ) {
          return input.toUpperCase();
        }

      }

      class NoPipeYo{}

      expect( isPipe( UppercasePipe ) ).to.equal( true );
      expect( isPipe( NoPipeYo ) ).to.equal( false );

    } );

  } );

} );
