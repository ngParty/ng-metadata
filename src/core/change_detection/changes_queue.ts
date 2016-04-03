// @TODO this needs to be in a singleton
import { isFunction } from '../../facade/lang';

const TTL = 10;
let onChangesTtl = TTL;


export class ChangesQueue{

  // The onChanges hooks should all be run together in a single digest
  // When changes occur, the call to trigger their hooks will be added to this queue
  onChangesQueue: Function[];

  flushOnChangesQueue: () => void;

  buildFlushOnChanges( $rootScope: ng.IRootScopeService ){

    const _context = this;

    buildFlushOnChangesCb( $rootScope );

    function buildFlushOnChangesCb( $rootScope: ng.IRootScopeService ): () => void {

      if(isFunction(_context.flushOnChangesQueue)){
        return _context.flushOnChangesQueue;
      }
      _context.flushOnChangesQueue = getFlushOnChangesQueueCb($rootScope);
      return _context.flushOnChangesQueue;

    }

    function getFlushOnChangesQueueCb( $rootScope: ng.IRootScopeService ): () => void {

      // This function is called in a $$postDigest to trigger all the onChanges hooks in a single digest
      return function _flushOnChangesQueue() {
        try {
          if (!(--onChangesTtl)) {
            // We have hit the TTL limit so reset everything
            _context.onChangesQueue = undefined;
            throw new Error(`infchng, ${TTL} ngOnChanges() iterations reached. Aborting!\n`);
          }
          // We must run this hook in an apply since the $$postDigest runs outside apply
          $rootScope.$apply(function() {
            for (var i = 0, ii = _context.onChangesQueue.length; i < ii; ++i) {
              _context.onChangesQueue[i]();
            }
            // Reset the queue to trigger a new schedule next time there is a change
            _context.onChangesQueue = undefined;
          });
        } finally {
          onChangesTtl++;
        }
      }


    }


  }

}

export const changesQueueService = new ChangesQueue();
