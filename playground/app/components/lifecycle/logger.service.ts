import { Injectable } from 'ng-metadata/core';
import { NgTimeout } from '../../shared/index';


@Injectable()
export class LoggerService {
  logs: string[] = [];
  prevMsg = '';
  prevMsgCount = 1;

  constructor( private $timeout: NgTimeout ) {}

  log( msg: string ) {
    if ( msg === this.prevMsg ) {
      // Repeat message; update last log entry with count.
      this.logs[ this.logs.length - 1 ] = msg + ` (${this.prevMsgCount += 1}x)`;
    } else {
      // New message; log it.
      this.prevMsg = msg;
      this.prevMsgCount = 1;
      this.logs.push( msg );
    }
  }

  clear() { this.logs.length = 0; }

  // schedules a view refresh to ensure display catches up
  tick() {
    this.$timeout( () => {
      console.log('tick')
    }, 0 );
  }
}


/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license
 */
