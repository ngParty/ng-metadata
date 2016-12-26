// @FIXME remove this line when https://github.com/ngParty/ng-metadata/issues/175 is resolved
///<reference path="../../manual_typings/globals.d.ts"/>

import * as angular from 'angular';
import { provide, OpaqueToken, Injectable } from 'ng-metadata/core';

import { TabsModule } from './components/tabs/index'
import { LifecycleHooksModule } from './components/lifecycle/index';
import { ChangeDetectorModule } from './components/change-detector/index';
import { TitleHandlerModule } from './components/title/index';


import { ElementReadyDirective } from './directives/element-ready.directive';
import { MyValidatorDirective } from './directives/my-validator.directive';
import { MyFooDirective } from './directives/my-foo.directive';
import { MyFormBridgeDirective } from './directives/my-form-bridge.directive';
import { MyDirectiveTesterDirective } from './directives/my-directive-tester.directive';
import { TesterAttrDirective } from './directives/my-tester.directive';
import { GlobalListenerDirective } from './directives/global-listener.directive';
import { TesterComponent } from './components/tester/tester.component';

export const DynamicValueToken = new OpaqueToken('_dynamicValueToken_');

@Injectable()
export class NgRxStore {
  getState(){ console.info('I should get state or so'); return {hello:'world'} }
}

@Injectable()
export class Dispatcher{}

export const SomeFactoryFnToken = new OpaqueToken('someFactory');

export class SomeClassToInstantiate{
  constructor(private $timeout:ng.ITimeoutService, private $log:ng.ILogService){}
  greetWithDelay(){ this.$timeout(()=>console.info('greetings from SomeClassToInstantiate with delay!'),1000)}
}

// this is just showcase how to define config for your app or if you are building 3rd party module
configureProviders.$inject = [ '$provide' ];
export function configureProviders( $provide ) {
    $provide.service( ...provide(NgRxStore, {useClass: NgRxStore}) )
    $provide.value( ...provide(DynamicValueToken, {useValue:'hello'}) );
    $provide.factory(...provide(SomeFactoryFnToken, { deps: ['$timeout', '$log'], useFactory: ($timeout, $log) => () => new SomeClassToInstantiate($timeout, $log) }));
}

export const Ng1LegacyModule = angular.module( 'LegacyNg1Module', [
  TabsModule,
  LifecycleHooksModule,
  ChangeDetectorModule,
  TitleHandlerModule
] )

  .directive( ...provide( ElementReadyDirective ) )

  .directive( ...provide( MyValidatorDirective ) )
  .directive( ...provide( MyFooDirective ) )
  .directive( ...provide( MyFormBridgeDirective ) )
  .directive( ...provide( MyDirectiveTesterDirective ) )
  .directive( ...provide( TesterComponent ) )
  .directive( ...provide( GlobalListenerDirective ) )
  .directive( ...provide( TesterAttrDirective ) )
  .name;
