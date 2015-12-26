declare var global: any;

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
