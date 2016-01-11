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
    // constant(object: Object): IModule;
    // value(object: Object): IModule;
    directive(...args: ProvideSpreadType[]): IModule;
    filter(...args: ProvideSpreadType[]): IModule;
    service(...args: ProvideSpreadType[]): IModule;
  }
}
