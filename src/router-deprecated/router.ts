import { Injectable } from '../core/di/decorators';
import { RouteRegistry } from './route_registry';
import { Instruction } from './instructions';
import { RouteDefinition } from './route_definition';

export abstract class Router {

  navigating: boolean;
  lastNavigationAttempt: string;
  hostComponent: string;
  parent: Router;
  registry: RouteRegistry;

  private _currentNavigation: any;
  private _outlet: any;
  private _auxRouters: any;
  private _childRouter: Router;

  /**
   * Constructs a child router. You probably don't need to use this unless you're writing a reusable
   * component.
   */
  abstract childRouter( hostComponent: any ): Router


  /**
   * Constructs a child router. You probably don't need to use this unless you're writing a reusable
   * component.
   */
  abstract auxRouter( hostComponent: any ): Router

  /**
   * Register an outlet to be notified of primary route changes.
   *
   * You probably don't need to use this unless you're writing a reusable component.
   */
  abstract registerPrimaryOutlet( outlet: any/*RouterOutlet*/ ): ng.IPromise<any>


  /**
   * Unregister an outlet (because it was destroyed, etc).
   *
   * You probably don't need to use this unless you're writing a custom outlet implementation.
   */
  abstract unregisterPrimaryOutlet( outlet: any/*RouterOutlet*/ ): void


  /**
   * Register an outlet to notified of auxiliary route changes.
   *
   * You probably don't need to use this unless you're writing a reusable component.
   */
  abstract registerAuxOutlet( outlet: any/*RouterOutlet*/ ): ng.IPromise<any>


  /**
   * Given an instruction, returns `true` if the instruction is currently active,
   * otherwise `false`.
   */
  abstract isRouteActive( instruction: Instruction ): boolean

  /**
   * Dynamically update the routing configuration and trigger a navigation.
   *
   * ### Usage
   *
   * ```
   * router.config([
   *   { 'path': '/', 'component': IndexComp },
   *   { 'path': '/user/:id', 'component': UserComp },
   * ]);
   * ```
   */
  abstract config( definitions: RouteDefinition[] ): ng.IPromise<any>

  /**
   * Navigate based on the provided Route Link DSL. It's preferred to navigate with this method
   * over `navigateByUrl`.
   *
   * ### Usage
   *
   * This method takes an array representing the Route Link DSL:
   * ```
   * ['./MyCmp', {param: 3}]
   * ```
   * See the {@link RouterLink} directive for more.
   */
  abstract navigate( linkParams: any[] ): ng.IPromise<any>


  /**
   * Navigate to a URL. Returns a promise that resolves when navigation is complete.
   * It's preferred to navigate with `navigate` instead of this method, since URLs are more brittle.
   *
   * If the given URL begins with a `/`, router will navigate absolutely.
   * If the given URL does not begin with `/`, the router will navigate relative to this component.
   */
  abstract navigateByUrl( url: string, _skipLocationChange?: boolean ): ng.IPromise<any>


  /**
   * Navigate via the provided instruction. Returns a promise that resolves when navigation is
   * complete.
   */
  abstract navigateByInstruction( instruction: Instruction, _skipLocationChange?: boolean ): ng.IPromise<any>

  /**
   * Updates this router and all descendant routers according to the given instruction
   */
  abstract commit( instruction: Instruction, _skipLocationChange?: boolean ): ng.IPromise<any>


  /**
   * Subscribe to URL updates from the router
   */
  abstract subscribe( onNext: ( value: any ) => void, onError?: ( value: any ) => void ): Object


  /**
   * Removes the contents of this router's outlet and all descendant outlets
   */
  abstract deactivate( instruction: Instruction ): ng.IPromise<any>


  /**
   * Given a URL, returns an instruction representing the component graph
   */
  abstract recognize( url: string ): ng.IPromise<Instruction>

  /**
   * Navigates to either the last URL successfully navigated to, or the last URL requested if the
   * router has yet to successfully navigate.
   */
  abstract renavigate(): ng.IPromise<any>


  /**
   * Generate an `Instruction` based on the provided Route Link DSL.
   */
  abstract generate( linkParams: any[] ): Instruction

}

@Injectable( '$rootRouter' )
export abstract class RootRouter extends Router {
  registry: RouteRegistry;
  location: Location;
  // primaryComponent: Type;

  abstract commit( instruction: Instruction, _skipLocationChange?: boolean ): ng.IPromise<any>

  abstract dispose(): void
}

@Injectable( '$router' )
export abstract class ChildRouter extends Router {

  parent: Router;
  hostComponent: any;

  abstract navigateByUrl( url: string, _skipLocationChange?: boolean ): ng.IPromise<any>

  abstract navigateByInstruction( instruction: Instruction, _skipLocationChange?: boolean ): ng.IPromise<any>
}
