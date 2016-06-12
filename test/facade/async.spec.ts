import { expect } from 'chai';
import * as sinon from 'sinon';
import { EventEmitter } from '../../src/facade/async';

describe( `facade/async`, () => {

  describe( `EventEmitter`, () => {

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

        const subscription = output.subscribe( sideEffectSpy );

        output.emit( 'han solo' );

        expect( sideEffectSpy.calledWith( 'han solo' ) ).to.equal( true );

        output.emit( 'han solo' );

        expect( sideEffectSpy.calledTwice ).to.equal( true );

        subscription.unsubscribe();

        output.emit( 'han solo' );

        expect( sideEffectSpy.calledTwice ).to.equal( true );

      } );

    } );

  } );

} );
