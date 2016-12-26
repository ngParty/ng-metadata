import {expect} from 'chai';
import {
  resolveDirectiveNameFromSelector,
  assign,
  stringify,
  hasCtorInjectables,
  firstToLowerCase,
  firstToUpperCase,
  toPath
} from '../../src/facade/lang';

describe( `facade/lang`, ()=> {

  describe( 'makeSelector', ()=> {

    it( 'should accept element selector and create camelCase from it', ()=> {

      const selector = 'hello-world';
      expect( resolveDirectiveNameFromSelector( selector ) ).to.equal( 'helloWorld' );

    } );
    it( 'should accept attribute selector and create camelCase from it', ()=> {

      const selector = '[im-your-father]';
      expect( resolveDirectiveNameFromSelector( selector ) ).to.equal( 'imYourFather' );

    } );
    it( 'should throw error when not valid element or attribute selector provided', ()=> {

      let selector = 'yabba daba';

      expect( ()=>resolveDirectiveNameFromSelector( selector ) ).to
        .throw( 'Only selectors matching element names or base attributes are supported, got: yabba daba' );

    } );

  } );
  describe( `assign`, ()=> {

    it( `should extend object exactly as Object.assign`, ()=> {

      const one = {foo:'yay'};
      const two = {foo:'nay',boo:'low'};

      const actual = assign(one,two);
      const expected = {foo:'nay',boo:'low'};

      expect( actual ).to.deep.equal( expected );
      expect( assign( {}, { one: 1 }, { two: 2 } ) ).to.deep.equal( { one: 1, two: 2 } );

    } );

  } );

  describe( 'stringify', ()=> {

    it( 'should return name property if it exist on provided type', ()=> {

      function foo() {}

      function boo() {
        return 'hello';
      }

      class Moo {}

      expect( stringify( foo ) ).to.equal( 'foo' );
      expect( stringify( boo ) ).to.equal( 'boo' );
      expect( stringify( Moo ) ).to.equal( 'Moo' );

    } );

    it( 'should return first line string of function definition if the function is anonymous',  ()=> {

      let anonFn = stringify(function () {});
      let anonFnMultiLine = stringify(function () {
        console.log( 'yoo' );
        return null;
      });

      expect( anonFn ).to.equal( 'function () { }' );
      expect( anonFnMultiLine ).to.equal( 'function () {' );

    } );

    it( `should return string of provided type if it isn't a function`,  ()=> {

      const obj = { hello: 'world' };

      expect( stringify( 'hello' ) ).to.equal( 'hello' );
      expect( stringify( null ) ).to.equal( 'null' );
      expect( stringify( undefined ) ).to.equal( 'undefined' );
      expect( stringify( [ 1, 2 ] ) ).to.equal( `1,2` );
      expect( stringify( obj ) ).to.equal( '[object Object]' );

    } );

  } );

  describe( 'hasInjectables', ()=> {

    it( 'should check if Type has $inject as array and its not empty', ()=> {

      class Moo {
        static $inject = [ 'hello' ];
      }
      class NoMames {
        static $inject = [];
      }
      const obj = { $inject: null };
      const name = 'jabba';

      expect( hasCtorInjectables( Moo ) ).to.equal( true );
      expect( hasCtorInjectables( NoMames ) ).to.equal( false );
      expect( hasCtorInjectables( obj ) ).to.equal( false );
      expect( hasCtorInjectables( name ) ).to.equal( false );

    } );


  } );

  describe( 'firstLowerCase', function () {

    it( 'should return string with first char lowercase', ()=> {

      expect( firstToLowerCase( 'JediMaster' ) ).to.equal( 'jediMaster' );

    } );

  } );
  describe( 'firstUpperCase', function () {

    it( 'should return string with first char uppercase',  ()=> {

      expect( firstToUpperCase( 'jediMaster' ) ).to.equal( 'JediMaster' );

    } );

  } );

  describe( `#toPath`, ()=> {

    it( `should create path array from basic string object path`, ()=> {

      const path = 'foo.moo.boo.hello';
      const actual = toPath( path );
      const expected = [ 'foo', 'moo', 'boo', 'hello' ];
      expect( actual ).to.deep.equal( expected );

    } );

    it( `should create path array from string/array object path`, ()=> {

      const path = 'foo.moo[0].boo[1].hello';
      const actual = toPath( path );
      const expected = [ 'foo', 'moo', '0', 'boo', '1', 'hello' ];
      expect( actual ).to.deep.equal( expected );

    } );

    it( `should return the same if path is already an array`, ()=> {

      const path = ['moo','boo'];
      const actual = toPath( path );
      const expected = ['moo','boo'];
      expect( actual ).to.deep.equal( expected );

    } );

  } );

} );
