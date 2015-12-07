import { getInjectableName } from './util';
import { is } from "./util";

/**
 * @internal
 * @type {string}
 */
export const INJECTABLE_NAME_TOKEN = '_name';
/**
 * static interface for Injectable
 * class will be decorated by _name static property
 */
export interface InjectableServiceConfigStatic {
  _name?: string
}
/**
 * Injectable type used for @Inject(Injectable) decorator
 */
export type InjectableToken = string | Function | InjectableServiceConfigStatic;

/**
 * @internal
 */
interface InjectableService extends Function,InjectableServiceConfigStatic {}

/**
 * A decorator that marks a class as injectable. It can then be injected into other annotated classes via the
 * @Inject decorator.
 * Optionally you can provide name, under which it will be registered during angular.service registration ( this
 * prevents JIT name generation )
 *
 * @example
 * ```ts
 * import { Injectable, Inject } from 'ng-metadata/ng-metadata';
 *
 * @Injectable()
 * class MyService {
 *   getData() {}
 * }
 *
 * @Injectable('fooSvc')
 * class GoodService {
 *   getData() {}
 * }
 *
 * @Injectable()
 * class MyOtherService {
 *  constructor(
 *    @Inject(MyService) myService: MyService,
 *    @Inject(GoodService) goodService: GoodService
 *  ) {
 *    this.data = myService.getData();
 *   }
 * }
 *
 * expect($injector.get('myService') instanceOf MyService).to.equal(true)
 * expect($injector.get('fooSvc') instanceOf GoodService).to.equal(true)
 * expect($injector.get('myOtherService') instanceOf MyOtherService).to.equal(true)
 * ```
 *
 * ###### Behind the scenes:
 *
 * it gets name property from provided class if JS engine supports it, else uses stringify on function and extracts
 * name from there. This string will be camel cased.
 * If you explicitly provide name parameter, this will be used and saved as _name static property.
 *
 * @param {string?} name explicitly provide name for service which will be used during angular registration
 * @returns {ClassDecorator}
 * @constructor
 */
export function Injectable( name?: string ): ClassDecorator {

  return _classDecorator;


  function _classDecorator( Type: InjectableService ): void {

    Type[ INJECTABLE_NAME_TOKEN ] = name || getInjectableName( Type );

  }

}


// custom type guards
export function isInjectable( Type: any ): Type is InjectableServiceConfigStatic {
  return is( Type, INJECTABLE_NAME_TOKEN );
}
