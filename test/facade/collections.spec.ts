import {expect} from 'chai';
import {ListWrapper,StringMapWrapper} from '../../src/facade/collections';

describe( `facade/collections`, ()=> {

  describe( `StringMapWrapper`, ()=> {


  } );

  describe( `ListWrapper`, ()=> {

    describe( `ES6 Array ponyfills`, ()=> {

      it( `should find array item or undefined if not found`, ()=> {

        let arr:any[] = [ 1, 2, 3, 4, 5 ];
        let found = ListWrapper.find( arr, ( el )=> el === 2 );
        expect( found ).equal( 2 );

        arr = [{name: 'adam'}, {name: 'eve'}, {name: 'john'}];
        found = ListWrapper.find(arr, (el)=>el.name === 'eve');
        expect(found).to.deep.equal({name: 'eve'});

      } );
      it( `should find array item position or -1 if not found`, ()=> {

        const arr = [10, 20, 30, 40];

        expect( ListWrapper.findIndex( arr, ( x )=>x === 30 ) ).to.equal( 2 );
        expect( ListWrapper.findIndex( arr, ( x )=>x === 'noop' ) ).to.equal( -1 );

      } );

    } );

  } );

} );
