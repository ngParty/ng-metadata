import { Injectable } from 'ng-metadata/core';

@Injectable( '$timeout' )
export abstract class NgTimeout {
  abstract cancel( promise?: angular.IPromise<any> ): boolean
}
