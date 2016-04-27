import { expect } from 'chai';
import * as sinon from 'sinon';
import { EventEmitter } from '../../src/facade/async';
import { isArray, isFunction } from '../../src/facade/lang';

describe( `facade/async`, () => {

  describe( `EventEmitter`, () => {

    describe( `static helpers`, () => {

      it( `should extend function by event emitter properties/functions`, () => {

        function myCallback() {}

        EventEmitter.makeNgExpBindingEmittable( myCallback );

        expect( isArray( (myCallback as any)._generatorOrNextFn ) ).to.equal( true );
        expect( isFunction( (myCallback as any).emit ) ).to.equal( true );
        expect( isFunction( (myCallback as any)._dispose ) ).to.equal( true );
        expect( isFunction( (myCallback as any).subscribe ) ).to.equal( true );

      } );

      it( `should properly call distinguish if context is instance of EventEmitter or Function and emit`, () => {

        const spy = sinon.spy();
        const instance = new EventEmitter();
        const fun = function ( payload ) { spy( payload ) };

        sinon.spy( instance, '_ngExpressionBindingCb' );

        ( EventEmitter as any ).createEmit( 'hello', instance );

        expect( ((instance as any)._ngExpressionBindingCb as Sinon.SinonSpy).calledWith( { $event: 'hello' } ) )
          .to
          .equal( true );


        EventEmitter.makeNgExpBindingEmittable( fun );
        ( EventEmitter as any ).createEmit( 'yo mama is fat!', fun, fun );

        expect( spy.calledWith( { $event: 'yo mama is fat!' } ) ).to.equal( true );

      } );

    } );

    describe( `instance`, () => {

      let ngOriginalOutputBinding;
      let output: EventEmitter<string>;

      beforeEach( () => {

        ngOriginalOutputBinding = sinon.spy();
        output = new EventEmitter<string>();
        output.wrapNgExpBindingToEmitter( ngOriginalOutputBinding );

      } );
      it( `should properly emit {$event: <value>} under the hood`, () => {

        output.emit( 'force awakens' );

        expect( ngOriginalOutputBinding.calledWith( { $event: 'force awakens' } ) ).to.equal( true );

      } );

      it( `should allow to subscribe for side effects`, () => {

        const sideEffectSpy = sinon.spy();

        const disposable = output.subscribe( sideEffectSpy );

        output.emit( 'han solo' );

        expect( sideEffectSpy.calledWith( 'han solo' ) ).to.equal( true );

        output.emit( 'han solo' );

        expect( sideEffectSpy.calledTwice ).to.equal( true );

        disposable();

        output.emit( 'han solo' );

        expect( sideEffectSpy.calledTwice ).to.equal( true );

      } );

    } );

  } );

} );
