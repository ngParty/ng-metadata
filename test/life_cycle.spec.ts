import {expect} from 'chai';
import {getLifecycleMethod,LifecycleHooks} from '../src/life_cycle';

describe( 'Life Cycle', function () {

  it( 'should return life cycle method name', function () {

    expect( getLifecycleMethod( LifecycleHooks.AfterContentInit ) ).to.equal( 'ngAfterContentInit' );
    expect( getLifecycleMethod( LifecycleHooks.OnDestroy ) ).to.equal( 'ngOnDestroy' );
    expect( getLifecycleMethod( LifecycleHooks.OnInit ) ).to.equal( 'ngOnInit' );

  } );

} );
