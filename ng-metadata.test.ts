import {Inject} from './src/di';
import {expect} from 'chai';

describe( 'ng-metadata', ()=> {

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

  } );

} );
