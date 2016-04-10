import {expect} from 'chai';
import {ListWrapper,StringMapWrapper} from '../../src/facade/collections';

describe( `facade/collections`, ()=> {

  describe( `StringMapWrapper`, ()=> {

    describe( `ES6/7 Object ponyfills`, ()=> {

      const obj = { foo: 1231, hello: 'yq', moo:{wat:'not'} } as {[key: string]: any};
      const actual = StringMapWrapper.values( obj );
      const expected = [ 1231, 'yq', { wat: 'not' } ];

      expect( actual ).to.deep.equal( expected );

    } );

    describe( `#baseGet`, ()=> {

      it( `should get value from object array path`, ()=> {

        const obj = { one: { two: {three: 3}}};
        const path = ['one','two','three'];
        const actual = StringMapWrapper.baseGet(obj,path);
        const expected = 3;

        expect(actual).to.equal(expected);

      } );

      it( `should get undefined from object array path if not found`, ()=> {

        const obj = { one: { two: {three: 3}}};
        const path = ['one','two','four'];
        const actual = StringMapWrapper.baseGet(obj,path);
        const expected = undefined;

        expect(actual).to.equal(expected);

      } );

    } );

    describe( `#getValueFromPath`, ()=> {

      it( `should get value from object string path`, ()=> {

        const obj = { one: { two: {three: 3}}};
        const path = 'one.two.three';
        const actual = StringMapWrapper.getValueFromPath(obj,path);
        const expected = 3;

        expect(actual).to.equal(expected);

      } );

      it( `should get default value if set or undefined if path didn't found a value`, ()=> {

        const obj = { one: { two: {three: 3}}};
        const path = 'one.two.three.four';
        let actual = StringMapWrapper.getValueFromPath(obj,path);
        let expected = undefined;

        expect(actual).to.equal(expected);

        actual = StringMapWrapper.getValueFromPath(obj,path,111);
        expected = 111;
        expect(actual).to.equal(expected);

      } );

      it( `should find path also if array indexes are used`, ()=> {

        const obj = { one: { two: [ { three: 3 } ] } };
        const path = 'one.two[0].three';
        const actual = StringMapWrapper.getValueFromPath(obj,path);
        const expected = 3;

        expect(actual).to.equal(expected);

      } );

    } );

    describe( `#setValueInPath`, ()=> {

      it( `should set value on object by path`, ()=> {

        let obj = { style: { font: { fontsize: '' } } };
        let path = 'style.font.fontsize';
        let actual = StringMapWrapper.setValueInPath(obj,path,'12px');
        let expected = { style: { font: { fontsize: '12px' } } };

        expect( actual ).to.deep.equal( expected );

      } );

      it( `should create property with value if path value not found`, ()=> {

        let obj = { style: { font: { fontsize: '' } } };
        let path = 'style.font.size';
        let actual = StringMapWrapper.setValueInPath(obj,path,'12px');
        let expected = { style: { font: { fontsize: '', size: '12px' } } };

        expect( actual ).to.deep.equal( expected );

      } );

    } );

    describe( `#assign`, ()=> {

      it( `should combine objects by extend`, ()=> {

        const mutatedObj = {one:1};
        const sourceOne = {two:2};
        let actual = StringMapWrapper.assign( mutatedObj, sourceOne, { one: '111' } as any );
        let expected = { one: '111', two: 2 };

        expect(actual).to.deep.equal(expected);
        expect( mutatedObj ).to.deep.equal( expected );
        expect( sourceOne ).to.deep.equal( sourceOne );

        const actual2 = StringMapWrapper.assign( {}, { foo: 'fooo', bar: 'baz' }, { twoo: 'phar' } as any );
        const expected2 = { foo: 'fooo', bar: 'baz', twoo: 'phar' };
        expect( actual2 ).to.deep.equal( expected2 );

      } );

      it( `should work as expected if Object.assign is not available`, ()=> {

        const envAssign = (Object as any).assign;
        (Object as any).assign = undefined;

        const mutatedObj = {one:1};
        const sourceOne = {two:2};
        let actual = StringMapWrapper.assign( mutatedObj, sourceOne, { one: '111' } as any );
        let expected = { one: '111', two: 2 };

        expect(actual).to.deep.equal(expected);
        expect( mutatedObj ).to.deep.equal( expected );
        expect( sourceOne ).to.deep.equal( sourceOne );

        (Object as any).assign = envAssign;

      } );

    } );

  } );

  describe( `ListWrapper`, ()=> {

    describe( `ES6 Array ponyfills`, ()=> {

      it( `should find array item or undefined if not found`, ()=> {

        let arr: any[] = [ 1, 2, 3, 4, 5 ];
        let found = ListWrapper.find( arr, ( el )=> el === 2 );
        expect( found ).equal( 2 );

        arr = [ { name: 'adam' }, { name: 'eve' }, { name: 'john' } ];
        found = ListWrapper.find( arr, ( el )=>el.name === 'eve' );
        expect( found ).to.deep.equal( { name: 'eve' } );

      } );
      it( `should find array item position or -1 if not found`, ()=> {

        const arr = [ 10, 20, 30, 40 ];

        expect( ListWrapper.findIndex( arr, ( x )=>x === 30 ) ).to.equal( 2 );
        expect( ListWrapper.findIndex( arr, ( x )=>x === 'noop' ) ).to.equal( -1 );

      } );

      it( `should fill array with provided value`, () => {

        let arr = [ 1, 2, 3 ];
        ListWrapper.fill( arr, 4 );
        expect( arr ).to.deep.equal( [ 4, 4, 4 ] );
        arr = [ 1, 2, 3 ];
        ListWrapper.fill( arr, 4, 1 );
        expect( arr ).to.deep.equal( [ 1, 4, 4 ] );
        arr = [ 1, 2, 3 ];
        ListWrapper.fill( arr, 4, 1, 2 );
        expect( arr ).to.deep.equal( [ 1, 4, 3 ] );
        arr = [ 1, 2, 3 ];
        ListWrapper.fill( arr, 4, 1, 1 );
        expect( arr ).to.deep.equal( [ 1, 2, 3 ] );
        arr = [ 1, 2, 3 ];
        ListWrapper.fill( arr, 4, -3, -2 );
        expect( arr ).to.deep.equal( [ 4, 2, 3 ] );
        arr = [ 1, 2, 3 ];
        ListWrapper.fill( arr, 4, NaN, NaN );
        expect( arr ).to.deep.equal( [ 1, 2, 3 ] );

      } );

    } );

  } );

} );
