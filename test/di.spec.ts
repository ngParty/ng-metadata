import {expect} from 'chai';
import {Inject} from '../src/di';
import {Pipe} from '../src/pipe';


describe( 'Inject', ()=> {

  it( 'should add $inject property as array on constructor function', ()=> {

    class Foo {
      constructor( @Inject( 'hello' ) hello ) {

      }
    }

    expect( Foo.$inject ).to.deep.equal( [ 'hello' ] );

  } );

  it( 'should add $inject property to static method if provided ', ()=> {

    class Foo {
      static hello( @Inject( 'jedi' ) jedi ) {
      }
    }

    expect( Foo.hello.$inject ).to.deep.equal( [ 'jedi' ] );

  } );

  it( 'should allow DI via reference so no strings are needed', function () {

    class HelloSvc{}

    @Pipe( { name: 'foo' } )
    class FooPipe {
      transform(){}
    }

    class Foo {
      constructor(
        @Inject( HelloSvc ) helloSvc,
        @Inject( FooPipe ) fooFilter
      ) {}
    }

    expect( Foo.$inject ).to.deep.equal( [ 'helloSvc', 'foo' ] );

  } );

  it( 'should use _name static property on injectable if exists during injection', function () {

    class HelloSvc{
      static _name = 'helloYo';
    }

    @Pipe( { name: 'foo' } )
    class FooPipe {
      transform(){}
    }

    class Foo {
      constructor(
        @Inject( HelloSvc ) helloSvc,
        @Inject( FooPipe ) fooFilter
      ) {}
    }

    expect( Foo.$inject ).to.deep.equal( [ 'helloYo', 'foo' ] );

  } );

} );
