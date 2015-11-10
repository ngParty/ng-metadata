import {expect} from 'chai';
import {getLifecycleMethod,LifecycleHooks} from '../src/life_cycle';

describe( 'Life Cycle', function () {

  it( 'should return life cycle method name', function () {

    expect( getLifecycleMethod( LifecycleHooks.AfterContentInit ) ).to.equal( 'afterContentInit' );
    expect( getLifecycleMethod( LifecycleHooks.OnDestroy ) ).to.equal( 'onDestroy' );
    expect( getLifecycleMethod( LifecycleHooks.OnInit ) ).to.equal( 'onInit' );

  } );

} );
