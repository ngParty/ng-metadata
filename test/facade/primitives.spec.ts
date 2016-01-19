import {expect} from 'chai';
import {StringWrapper} from "../../src/facade/primitives";

describe( `facade/primitives`, ()=> {

  describe( `ES6/7 ponyfills`, ()=> {

    it( `should correctly use String.prototype.startsWith`, ()=> {

      const str = 'To be, or not to be, that is the question.';

      expect(StringWrapper.startsWith(str,'To be')).to.equal(true);
      expect(StringWrapper.startsWith(str,'not to be')).to.equal(false);
      expect(StringWrapper.startsWith(str,'not to be', 10)).to.equal(true);

    } );
    it( `should correctly use String.prototype.endsWith`, ()=> {

      const str = 'To be, or not to be, that is the question.';

      expect( StringWrapper.endsWith( str, 'question.' ) ).to.equal( true );
      expect( StringWrapper.endsWith( str, 'to be' ) ).to.equal( false );
      expect( StringWrapper.endsWith( str, 'to be', 19 ) ).to.equal( true );

    } );
    it( `should correctly use String.prototype.includes`, ()=> {

      let actual = StringWrapper.includes( 'Blue Whale', 'blue' );
      let expected = false;

      expect( actual ).to.equal( expected );

      const str = 'To be, or not to be, that is the question.';

      expect( StringWrapper.includes( str, 'To be' ) ).to.equal( true );
      expect( StringWrapper.includes( str, 'question' ) ).to.equal( true );
      expect( StringWrapper.includes( str, 'nonexistent' ) ).to.equal( false );
      expect( StringWrapper.includes( str, 'To be', 1 ) ).to.equal( false );
      expect( StringWrapper.includes( str, 'TO BE' ) ).to.equal( false );

    } );

  } );

  describe( `string transforms`, ()=> {

    it( `should convert camelCase to kebabCase`, ()=> {

      const str = 'mooFooYooBoo';
      const actual = StringWrapper.kebabCase(str);
      const expected = 'moo-foo-yoo-boo';

      expect( actual ).to.equal( expected );

    } );

    it( `should convert camelCase to snakeCase`, ()=> {

      const str = 'mooFooYooBoo';
      const actual = StringWrapper.snakeCase(str);
      const expected = 'moo_foo_yoo_boo';

      expect( actual ).to.equal( expected );

    } );

  } );

} );
