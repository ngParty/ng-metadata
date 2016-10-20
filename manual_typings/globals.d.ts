import * as angular from 'angular';

///////////////////////////////////////////////////////////////////////////////
// functions attached to global object (window)
///////////////////////////////////////////////////////////////////////////////
declare global {
  type StringMap = {[key: string]: string};
  type Type = Function;
  type ProvideSpreadType = string|Type;
}

///////////////////////////////////////////////////////////////////////////////
// custom angular module overrides
// - add angular1 module overrides for proper ...provide handling
///////////////////////////////////////////////////////////////////////////////
declare module 'angular' {
  interface IParseService{
    ( exp: string, interceptorFn?: Function, expensiveChecks?: boolean ): ng.ICompiledExpression
  }
  interface IModule {
    value(...args: ProvideSpreadType[]): IModule;
    constant(...args: ProvideSpreadType[]): IModule;
    directive(...args: ProvideSpreadType[]): IModule;
    filter(...args: ProvideSpreadType[]): IModule;
    service(...args: ProvideSpreadType[]): IModule;
    provider(...args: ProvideSpreadType[]): IModule;
  }
  ///////////////////////////////////////////////////////////////////////////
  // AUTO module (angular.js)
  ///////////////////////////////////////////////////////////////////////////
  export module auto {

    ///////////////////////////////////////////////////////////////////////
    // ProvideService
    // see http://docs.angularjs.org/api/AUTO.$provide
    ///////////////////////////////////////////////////////////////////////
    interface IProvideService {
      // Documentation says it returns the registered instance, but actual
      // implementation does not return anything.
      // constant(name: string, value: any): any;
      /**
       * Register a constant service, such as a string, a number, an array, an object or a function, with the $injector. Unlike value it can be injected into a module configuration function (see config) and it cannot be overridden by an Angular decorator.
       */
      constant(...args: ProvideSpreadType[]): void;

      /**
       * Register a service decorator with the $injector. A service decorator intercepts the creation of a service, allowing it to override or modify the behaviour of the service. The object returned by the decorator may be the original service, or a new service object which replaces or wraps and delegates to the original service.
       *
       * @param name The name of the service to decorate.
       * @param decorator This function will be invoked when the service needs to be instantiated and should return the decorated service instance. The function is called using the injector.invoke method and is therefore fully injectable. Local injection arguments:
       *
       * $delegate - The original service instance, which can be monkey patched, configured, decorated or delegated to.
       */
      //decorator(name: string, decorator: Function): void;
      /**
       * Register a service decorator with the $injector. A service decorator intercepts the creation of a service, allowing it to override or modify the behaviour of the service. The object returned by the decorator may be the original service, or a new service object which replaces or wraps and delegates to the original service.
       *
       * @param name The name of the service to decorate.
       * @param inlineAnnotatedFunction This function will be invoked when the service needs to be instantiated and should return the decorated service instance. The function is called using the injector.invoke method and is therefore fully injectable. Local injection arguments:
       *
       * $delegate - The original service instance, which can be monkey patched, configured, decorated or delegated to.
       */
      //decorator(name: string, inlineAnnotatedFunction: any[]): void;
      factory(...args: ProvideSpreadType[]): IServiceProvider;
      provider(...args: ProvideSpreadType[]): IServiceProvider;
      service(...args: ProvideSpreadType[]): IServiceProvider;
      value(...args: ProvideSpreadType[]): IServiceProvider;
    }

  }

  /**
   * $rootScope - $rootScopeProvider - service in module ng
   * see https://docs.angularjs.org/api/ng/type/$rootScope.Scope and https://docs.angularjs.org/api/ng/service/$rootScope
   */
  interface IRootScopeService {

    // private members
    $$postDigest( callback: Function ): void,
    $$postDigestQueue: Function[],
    $$applyAsyncQueue: Function[],
    $$asyncQueue: Function[],
    $$watchers: Watchers[],
    $$watchersCount: number,
    $$listenerCount: Object,
    $$listeners: Object,
    $$destroyed: boolean,
    $$childHead: IScope,
    $$childTail: IScope,
    $$prevSibling: IScope,
    $$nextSibling: IScope,

    // ngMetadata private members
    $$disconnected?: boolean,

  }

  /* @private */
  interface Watchers {
    eq: boolean,
    exp: ( s: any, l: any, a: any, i: any ) => any,
    fn: ( newValue: any, oldValue: any ) => any,
    get: ( s: any, l: any, a: any, i: any ) => any,
    last: any
  }

}
