import {expect} from 'chai';
import {makeDecorator,makeParamDecorator,makePropDecorator} from '../../src/util/decorators';
import {isFunction} from "../../src/facade/lang";

describe( `util/decorators`, ()=> {


  it( `should create class decorator `, ()=> {

    class TestMetadata {}
    const ClsDecorator = makeDecorator( TestMetadata );

    expect( isFunction( ClsDecorator ) ).to.equal( true );

    @ClsDecorator()
    class Test {
    }

    expect( Object.keys( Test ).length ).to.equal( 1 );

  } );

  it( `should create property decorator`, ()=> {

    class TestMetadata {}
    const PropDecorator = makePropDecorator( TestMetadata );

    expect( isFunction( PropDecorator ) ).to.equal( true );


    class Test {
      @PropDecorator() foo: any;
    }
    expect( Object.keys( Test ).length ).to.equal( 1 );

  } );

  it( `should create parameter decorator`, ()=> {

    class TestMetadata {}
    const ParamDecorator = makeParamDecorator( TestMetadata );

    expect( isFunction( ParamDecorator ) ).to.equal( true );

    class Test {
      constructor( @ParamDecorator() moo: any ) {}
    }
    expect( Object.keys( Test ).length ).to.equal( 1 );

  } );

  it( `should override the paramDecorator method when callback provided`, ()=> {

    let wasOverrideCalled = false;

    function override( target, key, idx ) {
      wasOverrideCalled = true;
    }

    class TestMetadata {}
    const ParamDecorator = makeParamDecorator( TestMetadata, override );

    expect( isFunction( ParamDecorator ) ).to.equal( true );

    class Test {
      constructor( @ParamDecorator() moo: any ) {}
    }
    expect( Object.keys( Test ).length ).to.equal( 1 );
    expect( wasOverrideCalled ).to.equal( false );

    class TestOnMethod {
      foo( @ParamDecorator() moo: any ) {}
    }
    // if override it doesn't create metadata on class
    expect( Object.keys( TestOnMethod ).length ).to.equal( 0 );
    expect( wasOverrideCalled ).to.equal( true );

  } );


} );
