import { OpaqueToken } from '../../core/di/opaque_token';
import { Type } from '../../facade/type';
import { getInjectableName } from '../../core/di/provider';

/**
 * Let's say we have ngMetadata angular 1 Service:
 *
 * ```typescript
 * // heroes.service.ts
 * import { Injectable } from 'ng-metadata/core'
 * import { Hero } from './hero';
 *
 * @Injectable()
 * export class HeroesService {
 *  get() {
 *    return [
 *      new Hero(1, 'Windstorm'),
 *      new Hero(2, 'Spiderman'),
 *    ];
 *  }
 * }
 * ```
 *
 * registered within ng-metadata NgModule:
 *
 * ```typescript
 * // app.module.ts
 * import { NgModule } from 'ng-metadata/core';
 * import { HeroesService } from './heroes/heroes.service';
 *
 * @NgModule( {
 *  providers: [ HeroesService ]
 * } )
 * class AppModule {}
 * ```
 *
 * and we can upgrade it to Angular 2 like this:
 *
 * ```typescript
 * // app.module.ng2.ts
 * import { NgModule } from '@angular/core';
 * import { BrowserModule } from '@angular/platform-browser';
 * import { UpgradeModule } from '@angular/upgrade/static/';
 * import { provideNg1Injectable } from 'ng-metadata/upgrade';
 *
 * import { HeroComponent } from './heroes/hero.component.ng2';
 * import { HeroesService } from './heroes/heroes.service';
 *
 * @NgModule({
 *  imports: [
 *    BrowserModule,
 *    UpgradeModule
 *  ],
 *  declarations: [
 *    HeroComponent
 *  ],
 *  providers: [
 *    provideNg1Injectable('$routeParams'),
 *    provideNg1Injectable(HeroesService),
 *  ],
 *  entryComponents: [
 *    HeroComponent
 *  ]
 * })
 * export class AppModule {
 *    // preventing automatic Bootstrap
 *    ngDoBootstrap() {}
 * }
 * ```
 *
 * and now we can use it within angular 2 Component:
 * ```typescript
 * // hero.component.ng2.ts
 * import { Component, Inject } from '@angular/core';
 *
 * @Component({
 *  selector: 'my-hero',
 *  template: `<h1>My Hero</h1>`,
 * })
 * class HeroComponent {
 *  constructor(
 *    @Inject('$routeParams') private $routeParams: any, // by name using @Inject
 *    private myCoolSvc: MyCoolService, // by type using the user defined token
 *    private heroesSvc: HeroesService // by type using ngMetadata @Injectable service class
 *  ) {}
 * }
 * ```
 *
 * `provideNg1Injectable` accept also as main argument:
 *  - string(injected via @Inject('myString'))
 *  - OpaqueToken (injected via @Inject(myToken))
 *
 *  secondary(optional) argument `asToken` can be used when:
 *  - if you have ng1 service not registered with ng-metadata but it's a class and you wanna use this class for DI in ng2,
 *  then you have to do it like this:
 *
 *  ```typescript
 *  import * as angular from 'angular';
 *
 *  class MyCoolService {}
 *
 *  angular.module('myApp',[])
 *    .service('myCoolSvc',MyCoolService);
 *
 * @NgModule({
 *  imports: [
 *    BrowserModule,
 *    UpgradeModule
 *  ],
 *  declarations: [
 *    HeroComponent
 *  ],
 *  providers: [
 *    provideNg1Injectable('myCoolSvc',MyCoolService)
 *  ],
 *  entryComponents: [
 *    HeroComponent
 *  ]
 * })
 * export class AppModule {
 *    // preventing automatic Bootstrap
 *    ngDoBootstrap() {}
 * }
 *  ```
 */
export function upgradeInjectable(
  injectable: string|OpaqueToken|Function|Type,
  asToken: string|OpaqueToken|Function|Type = injectable
) {
  return {
    // this can be any token, but because we are using ng-metadata we are already using TS DI via type
    // allow to provide custom Token ( for instance if user want's just provide es6 class and service is registered via string in ng1 )
    provide: asToken,
    useFactory: ( $injector: ng.auto.IInjectorService ) => $injector.get<any>( getInjectableName( injectable ) ),
    deps: [ '$injector' ]
  }
}
