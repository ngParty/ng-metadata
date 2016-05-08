import * as angular from 'angular';
import { provide } from 'ng-metadata/core';
import {
  MarkForCheckComponent,
  DetachComponent,
  DataProvider,
  ChangeDetectorComponent,
  DataProvider2,
  ReattachComponent
} from './change-detector.component';


export const ChangeDetectorModule = angular
  .module( 'changeDetector', [] )
  .directive(...provide(ChangeDetectorComponent))
  .directive(...provide(MarkForCheckComponent))
  .directive(...provide(DetachComponent))
  .directive(...provide(ReattachComponent))
  .service(...provide(DataProvider))
  .service(...provide(DataProvider2))
  .name;

