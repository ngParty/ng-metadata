import { expect } from 'chai';
import { changesQueueService } from '../../../src/core/change_detection/changes_queue';
import { isFunction } from '../../../src/facade/lang';
import { $Scope } from '../../utils';

describe( `changes_queue`, () => {

  it( `should have undefined onChangesQueue and flushOnChangesQueue on init`, () => {

    expect( changesQueueService.onChangesQueue ).to.equal( undefined );
    expect( changesQueueService.flushOnChangesQueue ).to.equal( undefined );

  } );

  it( `should set #flushOnChangesQueue callback only once`, () => {

    const $rootScope = new $Scope();
    expect( changesQueueService.flushOnChangesQueue ).to.equal( undefined );

    changesQueueService.buildFlushOnChanges( $rootScope as any );

    expect( isFunction( changesQueueService.flushOnChangesQueue ) ).to.equal( true );

    const createdFlushOnChangesQueueCb = changesQueueService.flushOnChangesQueue;
    changesQueueService.buildFlushOnChanges( $rootScope as any );

    expect( changesQueueService.flushOnChangesQueue ).to.equal( createdFlushOnChangesQueueCb );

  } );

} );
