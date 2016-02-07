import { expect } from 'chai';
import {
  hasLifecycleHook,
  resolveImplementedLifeCycleHooks
} from '../../../src/core/linker/directive_lifecycles_reflector';
import { LifecycleHooks } from '../../../src/core/linker/directive_lifecycle_interfaces';

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

  it( `should create BooleanMap with implemented lifecycles`, ()=> {

    class Foo {
      ngOnInit() {}

      ngAfterViewInit() {}

      ngOnDestroy() {}
    }

    const actual = resolveImplementedLifeCycleHooks(Foo);
    const expected = {
      ngOnInit: true,
      ngAfterContentInit: false,
      ngAfterContentChecked: false,
      ngAfterViewInit: true,
      ngAfterViewChecked: false,
      ngOnDestroy: true,
      _ngOnChildrenChanged: false
    };

    expect( actual ).to.deep.equal( expected );

  } );

} );
