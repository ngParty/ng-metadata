import {expect} from 'chai';
import {OpaqueToken} from '../../../src/core/di/opaque_token';
import {globalKeyRegistry} from '../../../src/core/di/key';
import {Injectable} from '../../../src/core/di/decorators';

describe( `di/key`, ()=> {

  beforeEach( ()=> {
    globalKeyRegistry._reset();
  } );


  it( `should throw if you want create/get key for non Type(Service)`, ()=> {

    expect( ()=>globalKeyRegistry.get(('foo' as any)) ).to.throw();
    expect( ()=>globalKeyRegistry.get((1312 as any)) ).to.throw();
    expect( ()=>globalKeyRegistry.get(( {foo: 21312} as any )) ).to.throw();
    expect( ()=>globalKeyRegistry.get(( new OpaqueToken('moo') as any )) ).to.throw();

    expect( globalKeyRegistry.numberOfKeys ).to.equal( 0 );

  } );

  it( `should create and return unique key for classes names`, ()=> {

    class Foo{}
    class Moo{}

    expect( globalKeyRegistry.get( Foo ) ).to.equal( 'foo#1' );
    expect( globalKeyRegistry.get( Moo ) ).to.equal( 'moo#2' );

    expect( globalKeyRegistry.numberOfKeys ).to.equal( 2 );
    expect( globalKeyRegistry.allKeys ).to.deep.equal( [ 'foo#1', 'moo#2' ] );

  } );

} );
