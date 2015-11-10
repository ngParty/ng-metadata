import {expect} from 'chai';
import {makeSelector,stringify,hasInjectables} from '../src/util';

describe( 'utils', ()=> {

  describe( 'stringify', ()=> {

    it( 'should return name property if it exist on provided type', function () {

      function foo() {}

      class Moo {}

      expect( stringify( foo ) ).to.equal( 'foo' );
      expect( stringify( Moo ) ).to.equal( 'Moo' );

    } );

    it( 'should return string of provided type if it doesnt has name', function () {

      const obj = { hello: 'world' };

      expect( stringify( function () {} ) ).to.equal( `function () { }` );
      expect( stringify( obj ) ).to.equal( '[object Object]' );

    } );

  } );
  describe( 'hasInjectables', ()=> {

    it( 'should check if Type has $inject as array and its not empty', function () {

      class Moo {
        static $inject = [ 'hello' ];
      }
      class NoMames {
        static $inject = [];
      }
      const obj = { $inject: null };
      const name = 'jabba';

      expect( hasInjectables( Moo ) ).to.equal( true );
      expect( hasInjectables( NoMames ) ).to.equal( false );
      expect( hasInjectables( obj ) ).to.equal( false );
      expect( hasInjectables( name ) ).to.equal( false );

    } );


  } );
  describe( 'makeSelector', ()=> {

    it( 'should accept element selector and create camelCase from it', function () {

      const selector = 'hello-world';
      expect( makeSelector( selector ) ).to.equal( 'helloWorld' );

    } );
    it( 'should accept attribute selector and create camelCase from it', function () {

      const selector = '[im-your-father]';
      expect( makeSelector( selector ) ).to.equal( 'imYourFather' );

    } );
    it( 'should throw error when not valid element or attribute selector provided', function () {

      let selector = 'yabba daba';

      function willThrow() {
        return makeSelector( selector )
      }

      expect( willThrow ).to
        .throw( 'Only selectors matching element names or base attributes are supported, got: yabba daba' );

    } );

  } );

  describe( 'bootstrap', function () {

    it( 'should bootstrap angular app on document by default', function () {

    } );
    it( 'should bootstrap angular on provided root element', function () {


    } );
    it( 'should bootstrap angular app on provided css selector', function () {


    } );

  } );

} );
