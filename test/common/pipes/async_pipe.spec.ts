import { expect } from 'chai';
import * as sinon from 'sinon';
import { AsyncPipe } from '../../../src/common/pipes/async_pipe';
import { Observable, Subscriber } from 'rxjs/Rx';
import { $Scope } from '../../utils';

describe( `common/pipes/async_pipe`, () => {

  let asyncPipe: AsyncPipe;
  let scope;
  const sandbox = sinon.sandbox.create();

  beforeEach( () => {
    asyncPipe = new AsyncPipe();
    scope = new $Scope();
  } );
  afterEach( () => {
    (AsyncPipe as any).subscriptions = {};
    (AsyncPipe as any).values = {};
    (AsyncPipe as any).nextObjectID = 0;
    sandbox.restore();
  } );

  it( `should throw if using on Observable and scope is not provided`, () => {
    const input = Observable.of( 1, 2, 3, 4 );

    expect( ()=>asyncPipe.transform( input ) ).to.throw();
  } );
  it( `should work with $q promise`, () => {

    const input = { then: sandbox.spy( function (cb) { return cb('resolved'); } ) } as any;
    let output = asyncPipe.transform( input );

    expect( (input.then as Sinon.SinonSpy).calledOnce ).to.equal( true );
    expect( input[ '__asyncFilterObjectID__' ] ).to.equal( 1 );
    expect( (AsyncPipe as any).subscriptions ).to.deep.equal( { 1: undefined } );
    expect( (AsyncPipe as any).values ).to.deep.equal( { 1: 'resolved' } );
    expect( output ).to.equal( undefined );

    output = asyncPipe.transform( input );

    expect( (input.then as Sinon.SinonSpy).calledOnce ).to.equal( true );
    expect( output ).to.equal( 'resolved' );

  } );

  it( `should work with Observables`, (done) => {

    const input$ = Observable.interval( 4 ).take( 10 );
    let output = asyncPipe.transform( input$, scope );

    expect( input$[ '__asyncFilterObjectID__' ] ).to.equal( 1 );

    setTimeout( ()=> {
      expect( (AsyncPipe as any).values ).to.deep.equal( { 1: 9 } );
      expect( (AsyncPipe as any).subscriptions[ 1 ] ).to.be.an.instanceOf( Subscriber );

      output = asyncPipe.transform( input$, scope );
      expect( output ).to.equal( 9 );

      done();
    }, 60 )

  } );

} );
