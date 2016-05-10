import { Injectable } from 'ng-metadata/core';

@Injectable( '$log' )
export abstract class NgLog implements ng.ILogService {
  debug: angular.ILogCall;
  error: angular.ILogCall;
  info: angular.ILogCall;
  log: angular.ILogCall;
  warn: angular.ILogCall;
}
