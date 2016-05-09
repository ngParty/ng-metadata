import { Injectable } from 'ng-metadata/core';

@Injectable( '$timeout' )
export abstract class NgTimeout implements ng.ITimeoutService {
  constructor(fn: (...args: any[]) => any, delay?: number, invokeApply?: boolean, ...args: any[]): angular.IPromise<any>{
    return;
  }
  abstract cancel( promise?: angular.IPromise<any> ): boolean
}
