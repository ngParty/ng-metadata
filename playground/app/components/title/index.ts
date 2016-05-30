import * as angular from 'angular';
import { provide } from 'ng-metadata/core';

import { TitleHandlerComponent } from './title-handler.component';

export const TitleHandlerModule = angular
  .module( 'titleHandler', [] )
  .directive( ...provide( TitleHandlerComponent ) )
  .name;
