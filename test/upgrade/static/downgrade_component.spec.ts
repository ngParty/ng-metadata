import * as sinon from 'sinon';
import { expect } from 'chai';

import { isFunction } from '../../../src/facade/lang';
import {
  downgradeNg2Component,
  provideNg2Component,
  _downgradeComponent
} from '../../../src/upgrade/static/downgrade_component';
import { Component, Input, Output, EventEmitter } from '@angular/core';

describe( `downgrade_component`, () => {
  describe( `downgradeNg2Component`, () => {
    it( `should be a function`, () => {
      expect( isFunction( downgradeNg2Component ) ).to.equal( true );
    } );
  } );
  describe( `provideNg2Component`, () => {
    it( `should be a function`, () => {
      expect( isFunction( provideNg2Component ) ).to.equal( true );
    } );
  } );
  describe( `_downgradeComponent`, () => {

    let downgradeFnStub: Sinon.SinonStub;
    const noop = () => {};

    @Component({
      selector:'with-inout',
      template: '',
    })
    class WithInOutComponent{
      @Input() name: string;
      @Output() call = new EventEmitter<any>();
    }

    @Component({
      selector: 'just-cmp',
      template: '',
    })
    class JustCmpComponent{}

    beforeEach( () => {
      downgradeFnStub = sinon.stub();
      downgradeFnStub.returns(noop)
    } );
    it( `should downgrade ng2Component to ng1 directive name and directiveFactory`, () => {
      const downgradedResult = _downgradeComponent( { component: JustCmpComponent, downgradeFn: downgradeFnStub } );

      expect( downgradeFnStub.called ).to.equal( true );
      expect( downgradeFnStub.calledWith( {
        component: JustCmpComponent,
      } ) ).to.equal( true );
      expect( downgradedResult ).to.deep.equal( {
        name: 'justCmp',
        factoryFn: noop
      } )

    } );
    it( `should automatically extract inputs and outputs from ng2Components @Input,@Output`, () => {

      const downgradedResult = _downgradeComponent( { component: WithInOutComponent, downgradeFn: downgradeFnStub } );

      expect( downgradeFnStub.called ).to.equal( true );
      expect( downgradeFnStub.calledWith( {
        inputs: [ 'name' ],
        outputs: [ 'call' ],
        component: WithInOutComponent,
      } ) ).to.equal( true );
      expect( downgradedResult ).to.deep.equal( {
        name: 'withInout',
        factoryFn: noop
      } )

    } );
  } );
} );
