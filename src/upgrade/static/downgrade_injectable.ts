import { OpaqueToken } from '../../core/di/opaque_token';
import { getInjectableName } from '../../core/di/provider';
import { ProviderLiteral } from '../../core/di/provider_util';
import { Type } from '../../facade/type';

export type ProvideNg2InjectableParams = {
  injectable: Function | Type,
  downgradeFn: Function,
  /**
   * We need token only if downgraded Angular 2 Service is not Decorated with both ng2 @Injectable and ngMetadata @Injectable
   *
   */
  token?: string | OpaqueToken,
}

/**
 * Downgrades an Angular 2 Injectable so that it can be registered as an Angular 1
 * factory. Either a string or an ng-metadata OpaqueToken can be used for the name.
 *
 * **NOTE:** downgraded service must also be registered within Angular 2 `@Component` or `@NgModule`
 *
 * @example
 * ```typescript
 * // app.module.ts
 * import * as angular from 'angular'
 * import { downgradeInjectable } from '@angular/upgrade/static/';
 * import { downgradeNg2Injectable } from 'ng-metadata/upgrade';
 * import { provide } from 'ng-metadata/core';
 *
 * import { Ng2Service } from './services/ng2.service';
 * import { Ng2ServiceDecorated } from './services/ng2decorated.service';
 *
 * export const OtherServiceToken = new OpaqueToken('otherService')
 *
 * export const AppModule = angular
 *  .module('myApp',[])
 *  .factory(...downgradeNg2Injectable({token:'ng2Service', injectable: Ng2Service, downgradeFn: downgradeInjectable }))
 *  .factory(...downgradeNg2Injectable({token: OtherServiceToken, injectable: Ng2Service, downgradeFn: downgradeInjectable }))
 *  .factory(...downgradeNg2Injectable({injectable:Ng2ServiceDecorated, downgradeFn: downgradeInjectable}))
 * ```
 */
export function downgradeNg2Injectable( { injectable, downgradeFn, token }: ProvideNg2InjectableParams ): [string|Function] {
  const { name, factoryFn } = _downgradeInjectable( {
    token: token || injectable as any,
    injectable,
    downgradeFn
  } );
  return [ name, factoryFn ]
}


/**
 *
 * Used to register an Angular 2 Service by including it in the `providers` array of an ng-metadata `@NgModule`,
 * where the service name and downgraded factory functions are automatically generated.
 *
 * **NOTE:** downgraded service must also be registered within Angular 2 Component or NgModule
 *
 * Returns a `ProviderLiteral` which can be used to register an Angular 2 Provider/Injectable
 * by including it in the providers array of an ng-metadata annotated Angular 1
 * `@Component` or `@NgModule`. Either a string or an ng-metadata OpaqueToken can be used for the name.
 *
 * @example
 * ```
 * // foo.component.ts - Angular 1(ngMetadata)
 * import { downgradeInjectable } from '@angular/upgrade/static/';
 * import { provideNg2Injectable } from 'ng-metadata/upgrade';
 * import { Component } from 'ng-metadata/core';
 *
 * import { Ng2Service } from './services/ng2.service';
 * import { Ng2ServiceDecorated } from './services/ng2decorated.service';
 *
 * const OtherServiceToken = new OpaqueToken('otherService')
 *
 * @Component({
   *  selector: 'my-foo',
   *  providers: [
   *    provideNg2Injectable({token:'ng2Service', injectable: Ng2Service, downgradeFn: downgradeInjectable }),
   *    provideNg2Injectable({token:OtherServiceToken, injectable: Ng2Service, downgradeFn: downgradeInjectable }),
   *    provideNg2Injectable({injectable:Ng2ServiceDecorated, downgradeFn: downgradeInjectable}),
   *  ],
   * })
 * class FooComponent{}
 * ```
 *
 * or via ngMetadata NgModule:
 *
 * @example
 * ```typescript
 * * @example
 * ```
 * // app.module.ts - Angular 1(ngMetadata)
 * import { downgradeInjectable } from '@angular/upgrade/static/';
 * import { provideNg2Injectable } from 'ng-metadata/upgrade';
 * import { NgModule } from 'ng-metadata/core';
 *
 * import { Ng2Service } from './services/ng2.service';
 * import { Ng2ServiceDecorated } from './services/ng2decorated.service';
 *
 * const OtherServiceToken = new OpaqueToken('otherService')
 *
 * @NgModule({
   *  providers: [
   *    provideNg2Injectable({token:'ng2Service', injectable: Ng2Service, downgradeFn: downgradeInjectable }),
   *    provideNg2Injectable({token:OtherServiceToken, injectable: Ng2Service, downgradeFn: downgradeInjectable }),
   *    provideNg2Injectable({injectable:Ng2ServiceDecorated, downgradeFn: downgradeInjectable}),
   *  ],
   * })
 * export class AppModule{}
 * ```
 *
 * as you've may noticed in one registration we've omitted `token`, how is that possible that it works you ask?
 * this is thanks to ngMetadata `@Injectable()` decorator, we can decorate Angular 2 Classes with our ngMetadata `@Injectable`,
 * which gives us benefit to omit Opaque tokens creation and use the same class for DI for both Angular 2 and Angular 1.
 * POWER OVERWHELMING RIGHT?!
 *
 * Enough Talk! Show me how the service looks like:
 * ```typescript
 * // ./services/ng2decorated.service.ts
 *
 * import {Injectable} from '@angular/core';
 * import {Injectable as KeepNg1Injectable} from 'ng-metadata/core';
 *
 * @KeepNg1Injectable()
 * @Injectable()
 * export class Ng2ServiceDecorated {
 *  constructor(){}
 *  greet(){}
 * }
 * ```
 */
export function provideNg2Injectable( { injectable, downgradeFn, token }: ProvideNg2InjectableParams ): ProviderLiteral {
  const { name, factoryFn, deps } = _downgradeInjectable( {
    token: token || injectable as any,
    injectable,
    downgradeFn
  } );

  return {
    provide: name,
    useFactory: factoryFn,
    deps: deps,
  };
}

/**
 *
 * @private
 * @internal
 */
export function _downgradeInjectable( { token, injectable, downgradeFn }: ProvideNg2InjectableParams ): {name: string, factoryFn: Function, deps: string[]} {
  const downgradedInjectableFactory = downgradeFn( injectable );
  const { $inject = [] } = downgradedInjectableFactory;
  const name = getInjectableName( token );

  return {
    name,
    factoryFn: downgradedInjectableFactory,
    deps: $inject
  };
}
