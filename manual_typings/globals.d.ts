// TODO: ideally the node.d.ts reference should be scoped only for files that need and not to all
//       the code including client code
/// <reference path="../typings/browser/ambient/node/node.d.ts" />

// @TODO add angular1 module overrides for proper ...provide handling

interface BrowserNodeGlobal {
  Object: typeof Object,
  Array: typeof Array,
  //Map: typeof Map,
  //Set: typeof Set,
  Date: typeof Date,
  RegExp: typeof RegExp,
  JSON: typeof JSON,
  Math: typeof Math,
  angular: angular.IAngularStatic,
  //assert(condition: any): void,
  Reflect: any,
  //zone: Zone,
  //getAngularTestability: Function,
  //getAllAngularTestabilities: Function,
  setTimeout: Function,
  clearTimeout: Function,
  setInterval: Function,
  clearInterval: Function
}

declare type StringMap = {[key:string]:string};
declare type Type = Function;
declare type ProvideSpreadType = string|Type;

declare module angular {
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

}
