import { expect } from 'chai';
import { resolveForwardRef, forwardRef } from '../../../src/core/di/forward_ref';
import { Inject, Injectable, Host } from '../../../src/core/di/decorators';
import { provide, getInjectableName } from '../../../src/core/di/provider';
import { globalKeyRegistry } from '../../../src/core/di/key';
import { Pipe } from '../../../src/core/pipes/decorators';
import { Directive } from '../../../src/core/directives/decorators';

describe( `forward_ref`, ()=> {

  describe( `resolveForwardRef`, ()=> {

    it( `should behave as identity function for non forwardRef type`, ()=> {

      expect( resolveForwardRef( 'hello' ) ).to.equal( 'hello' );

      const arr = [ 1, 23, 4 ];
      expect( resolveForwardRef( arr ) ).to.equal( arr );

    } );

    it( `should execute forwardRef fn and return it's value `, ()=> {

      let fRef = forwardRef( ()=>'hello' );
      expect( resolveForwardRef(fRef) ).to.equal( 'hello' );

      const obj = { one: 1, two: 'hello'};
      fRef = forwardRef(()=>obj);
      expect( resolveForwardRef(fRef) ).to.equal( obj );


      class Foo{}
      fRef = forwardRef(()=>Foo);
      expect( resolveForwardRef(fRef) ).to.equal( Foo );

    } );

  } );

  describe( `forwardRef for @Inject()`, ()=> {

    beforeEach( ()=> {

      globalKeyRegistry._reset();

    } );

    it( `should not throw when executing before class is defined`, ()=> {

      expect( ()=> {
        const fRef = forwardRef(()=>Foo);
        class Foo{}
      } ).to.not.throw();


      const fRef = forwardRef(()=>Foo) as Function;
      class Foo{}

      expect( fRef() ).to.equal( Foo );


    } );
    it( `should work for injecting services`, ()=> {

      @Injectable()
      class Consumer{
        constructor(@Inject(forwardRef(()=>Reporter)) private reporter){}
      }

      @Injectable()
      class Reporter{}

      expect( ()=>provide( Consumer ) ).to.not.throw();

      const [,ConsumerSvc] = provide(Consumer);

      expect( ConsumerSvc.$inject ).to.deep.equal( [ 'reporter#2' ] );

    } );

    it( `should work for injecting pipes`, ()=> {

      @Injectable()
      class Consumer{
        constructor(@Inject(forwardRef(()=>LowerMePipe)) private lowerMe){}
      }

      @Pipe({name:'lowerMe'})
      class LowerMePipe{}

      expect( ()=>provide( Consumer ) ).to.not.throw();

      const [,ConsumerSvc] = provide(Consumer);

      expect( ConsumerSvc.$inject ).to.deep.equal( [ 'lowerMe' ] );


    } );

    it( `should work for injecting directives`, ()=> {

      @Injectable()
      class Consumer{
        constructor(@Inject(forwardRef(()=>LightsaberEnhancerDirective)) @Host() private lightsaberEnhancer){}
      }

      @Directive({selector:'[lightsaber-enhancer]'})
      class LightsaberEnhancerDirective{}

      expect( ()=>provide( Consumer ) ).to.not.throw();

      const [,ConsumerSvc] = provide(Consumer);

      expect( ConsumerSvc.$inject ).to.deep.equal( [getInjectableName(LightsaberEnhancerDirective)] );

    } );

  } );

} );
