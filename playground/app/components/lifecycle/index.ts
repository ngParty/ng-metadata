import * as angular from 'angular';
import { provide } from 'ng-metadata/core';
import { DoCheckComponent, DoCheckParentComponent } from './do-check.component';
import { OnChangesComponent, OnChangesParentComponent } from './on-changes.component';

export const LifecycleHooksModule = angular.module('lifecyceHooks', [])
  .directive(...provide(DoCheckParentComponent))
  .directive(...provide(DoCheckComponent))
  .directive(...provide(OnChangesParentComponent))
  .directive(...provide(OnChangesComponent))
  .name;
