import {expect} from 'chai';
import {
  makeSelector,
  stringify,
  hasInjectables,
  firstLowerCase,
  firstUpperCase,
  controllerKey
} from '../src/util';

describe( 'utils', ()=> {

  describe( 'stringify', ()=> {

    it( 'should return name property if it exist on provided type', function () {

      function foo() {}

      function boo() {

        return 'hello';

      }

      class Moo {}

      expect( stringify( foo ) ).to.equal( 'foo' );
      expect( stringify( boo ) ).to.equal( 'boo' );
      expect( stringify( Moo ) ).to.equal( 'Moo' );

    } );

    it( 'should return empty string if the function is anonymous', function () {

      let anonFn = function () {};

      expect( stringify(anonFn) ).to.equal( '' );

    } );

    it( `should return string of provided type if it isn't a function`, function () {

      const obj = { hello: 'world' };

      expect( stringify( [ 1, 2 ] ) ).to.equal( `1,2` );
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
  describe( 'firstLowerCase', function () {

    it( 'should return string with first char lowercase', function () {

      expect( firstLowerCase( 'JediMaster' ) ).to.equal( 'jediMaster' );

    } );

  } );
  describe( 'firstUpperCase', function () {

    it( 'should return string with first char uppercase', function () {

      expect( firstUpperCase( 'jediMaster' ) ).to.equal( 'JediMaster' );

    } );

  } );
  describe( 'controllerKey', function () {

    it( 'should return controller name prefixed nas suffixed to get it from the angular', function () {

      expect( controllerKey( 'MyFoo' ) ).to.equal( '$MyFooController' );

    } );

  } );

} );
