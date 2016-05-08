import {expect} from 'chai';
import {makeDecorator,makeParamDecorator,makePropDecorator} from '../../../src/core/util/decorators';
import {isFunction} from '../../../src/facade/lang';

describe( `util/decorators`, ()=> {


  it( `should create class decorator `, ()=> {

    class TestMetadata {}
    const ClsDecorator = makeDecorator( TestMetadata );

    expect( isFunction( ClsDecorator ) ).to.equal( true );

    @ClsDecorator()
    class Test {}

    const annotations = Reflect.getOwnMetadata( 'annotations', Test );

    expect( annotations.length ).to.equal( 1 );

  } );

  it( `should create class decorator with optional id token if provided`, () => {

    class CustomInjectable {
      constructor( public id: string ) {}
    }
    const CustomInjectableDecorator = makeDecorator( CustomInjectable );

    @CustomInjectableDecorator('hello')
    class TestWithInjectable {}


    expect( Reflect.getOwnMetadata( 'annotations', TestWithInjectable ).length ).to.equal( 1 );
    expect( Reflect.getOwnMetadata( 'annotations', TestWithInjectable )[0].id).to.equal( 'hello' );

  } );

  it( `should create property decorator`, ()=> {

    class TestMetadata {}
    const PropDecorator = makePropDecorator( TestMetadata );

    expect( isFunction( PropDecorator ) ).to.equal( true );


    class Test {
      @PropDecorator() foo: any;
    }

    const propMetadata = Reflect.getOwnMetadata( 'propMetadata', Test );

    expect( Object.keys( propMetadata ).length ).to.equal( 1 );

  } );

  it( `should create parameter decorator`, ()=> {

    class TestMetadata {}
    const ParamDecorator = makeParamDecorator( TestMetadata );

    expect( isFunction( ParamDecorator ) ).to.equal( true );

    class Test {
      constructor( @ParamDecorator() moo: any ) {}
    }

    const parameters = Reflect.getOwnMetadata( 'parameters', Test );
    expect( parameters.length ).to.equal( 1 );

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

    const parameters = Reflect.getOwnMetadata( 'parameters', Test );
    expect( parameters.length ).to.equal( 1 );
    expect( wasOverrideCalled ).to.equal( false );


    // callback overrides works only in constructor
    // ====
    class TestOnMethod {
      foo( @ParamDecorator() moo: any ) {}
    }

    const noParameters = Reflect.getOwnMetadata( 'parameters', TestOnMethod );
    // if override it doesn't create metadata on class
    expect( noParameters ).to.equal( undefined );
    expect( wasOverrideCalled ).to.equal( true );

  } );


} );
