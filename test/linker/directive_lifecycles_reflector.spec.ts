import {expect} from 'chai';
import {hasLifecycleHook} from "../../src/linker/directive_lifecycles_reflector";
import {LifecycleHooks} from "../../src/linker/directive_lifecycle_interfaces";

describe( `linker/lifecycles_reflector`, ()=> {

  it( `should properly check if class implements one of life cycle hooks`, ()=> {

    class Foo{
      ngAfterContentInit(){}
    }

    expect( hasLifecycleHook( LifecycleHooks.AfterContentInit, Foo ) ).to.equal( true );
    expect( hasLifecycleHook( LifecycleHooks.AfterViewInit, Foo ) ).to.equal( false );

    class Test{
      ngOnInit(){}
      ngOnDestroy(){}
    }

    expect( hasLifecycleHook( LifecycleHooks.OnInit, Test ) ).to.equal( true );
    expect( hasLifecycleHook( LifecycleHooks.OnDestroy, Test ) ).to.equal( true );

  } );

} );
