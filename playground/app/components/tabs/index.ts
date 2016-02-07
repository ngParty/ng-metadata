import * as angular from 'angular';
import { provide } from 'ng-metadata/core';

import { TabsComponent } from './tabs';
import { TabsChildComponent } from './viewChild';
import { TabsContentComponent } from './contentChild';

export const TabsModule = angular.module('myTabs',[])
  .directive(...provide(TabsComponent))
  .directive(...provide(TabsChildComponent))
  .directive(...provide(TabsContentComponent))
  .name 