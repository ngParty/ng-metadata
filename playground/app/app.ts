//import * as angular from 'angular';
import 'angular';
import { provide, makeDirective } from 'ng-metadata/ng-metadata';
import { AppCmp } from './app.component';
import { ElementReadyDirective } from './element-ready.directive';

export const AppModule = angular.module( 'app', [] )
  .directive( provide( AppCmp ), makeDirective( AppCmp ) )
  .directive( provide( ElementReadyDirective ), makeDirective( ElementReadyDirective ) );
