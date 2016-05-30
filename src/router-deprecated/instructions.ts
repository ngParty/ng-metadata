/**
 * `RouteParams` is an immutable map of parameters for the given route
 * based on the url matcher and optional parameters for that route.
 *
 * You can inject `RouteParams` into the constructor of a component to use it.
 *
 * ### Example
 *
 * ```
 * import {Component} from '@angular/core';
 * import {bootstrap} from '@angular/platform-browser/browser';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig, RouteParams} from
 * 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {path: '/user/:id', component: UserCmp, name: 'UserCmp'},
 * ])
 * class AppCmp {}
 *
 * @Component({ template: 'user: {{id}}' })
 * class UserCmp {
 *   id: string;
 *   constructor(params: RouteParams) {
 *     this.id = params.get('id');
 *   }
 * }
 *
 * bootstrap(AppCmp, ROUTER_PROVIDERS);
 * ```
 */
export type RouteParams = {
  params: {[key: string]: string};

  // @TODO this doesn't work with downgraded router to ng1
  // get(param: string): string { return normalizeBlank(StringMapWrapper.get(this.params, param)); }
}

/**
 * `RouteData` is an immutable map of additional data you can configure in your {@link Route}.
 *
 * You can inject `RouteData` into the constructor of a component to use it.
 *
 * ### Example
 *
 * ```
 * import {Component} from '@angular/core';
 * import {bootstrap} from '@angular/platform-browser/browser';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig, RouteData} from
 * 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {path: '/user/:id', component: UserCmp, name: 'UserCmp', data: {isAdmin: true}},
 * ])
 * class AppCmp {}
 *
 * @Component({
 *   ...,
 *   template: 'user: {{isAdmin}}'
 * })
 * class UserCmp {
 *   string: isAdmin;
 *   constructor(data: RouteData) {
 *     this.isAdmin = data.get('isAdmin');
 *   }
 * }
 *
 * bootstrap(AppCmp, ROUTER_PROVIDERS);
 * ```
 */
export type RouteData = {
  data: {[key: string]: any},

// @TODO this doesn't work with downgraded router to ng1
//   get(key: string): any { return normalizeBlank(StringMapWrapper.get(this.data, key)); }
}

/**
 * `Instruction` is a tree of {@link ComponentInstruction}s with all the information needed
 * to transition each component in the app to a given route, including all auxiliary routes.
 *
 * `Instruction`s can be created using {@link Router#generate}, and can be used to
 * perform route changes with {@link Router#navigateByInstruction}.
 *
 * ### Example
 *
 * ```
 * import {Component} from '@angular/core';
 * import {bootstrap} from '@angular/platform-browser/browser';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from
 * '@angular/router-deprecated';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   constructor(router: Router) {
 *     var instruction = router.generate(['/MyRoute']);
 *     router.navigateByInstruction(instruction);
 *   }
 * }
 *
 * bootstrap(AppCmp, ROUTER_PROVIDERS);
 * ```
 */
export type Instruction = {

  component: ComponentInstruction;
  child: Instruction;
  auxInstruction: {[key: string]: Instruction};

  // get()
  urlPath: string;
  // get()
  urlParams: string[];
  // get()
  specificity: string

  resolveComponent(): ng.IPromise<ComponentInstruction>;

  /**
   * converts the instruction into a URL string
   */
  toRootUrl(): string;

  /** @internal */
  _toNonRootUrl(): string;

  toUrlQuery(): string;

  /**
   * Returns a new instruction that shares the state of the existing instruction, but with
   * the given child {@link Instruction} replacing the existing child.
   */
  replaceChild(child: Instruction): Instruction;

  /**
   * If the final URL for the instruction is ``
   */
  toUrlPath(): string;

  // default instructions override these
  toLinkUrl(): string;

  // this is the non-root version (called recursively)
  /** @internal */
  _toLinkUrl(): string;

  /** @internal */
  _stringifyPathMatrixAuxPrefixed(): string;

  /** @internal */
  _stringifyMatrixParams(): string;

  /** @internal */
  _stringifyPathMatrixAux(): string;

  /** @internal */
  _stringifyAux(): string;
}


/**
 * A `ComponentInstruction` represents the route state for a single component.
 *
 * `ComponentInstructions` is a public API. Instances of `ComponentInstruction` are passed
 * to route lifecycle hooks, like {@link CanActivate}.
 *
 * `ComponentInstruction`s are [hash consed](https://en.wikipedia.org/wiki/Hash_consing). You should
 * never construct one yourself with "new." Instead, rely on router's internal recognizer to
 * construct `ComponentInstruction`s.
 *
 * You should not modify this object. It should be treated as immutable.
 */
export type ComponentInstruction = {
  reuse: boolean;
  urlPath: string;
  urlParams: string[];
  routeData: RouteData;
  componentType: string;
  terminal: boolean;
  specificity: string;
  params: {[key: string]: string};
  routeName: string;
}
