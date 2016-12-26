import { Injectable } from '../core/di/decorators';
import { RouteDefinition } from './route_definition';
import { Instruction } from './instructions';
import { OpaqueToken } from '../core/di/opaque_token';
import { Type } from '../facade/type';


/**
 * Token used to bind the component with the top-level {@link RouteConfig}s for the
 * application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from '@angular/core';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig
 * } from '@angular/router-deprecated';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [
 *    ROUTER_PROVIDERS,
 *    provide(ROUTER_PRIMARY_COMPONENT, {useValue: AppCmp})
 * ])
 * ```
 */
// export const ROUTER_PRIMARY_COMPONENT: OpaqueToken = new OpaqueToken('RouterPrimaryComponent');
// angular 1 specific
export const ROUTER_PRIMARY_COMPONENT: OpaqueToken = new OpaqueToken('$routerRootComponent');

/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
@Injectable('RouteRegistry')
export abstract class RouteRegistry {

  private _rootComponent: string;
  private _rules: any;

  /**
   * Given a component and a configuration object, add the route to this registry
   */
  abstract config(parentComponent: any, config: RouteDefinition): void

  /**
   * Reads the annotations of a component and configures the registry based on them
   */
  abstract configFromComponent(component: any): void

  /**
   * Given a URL and a parent component, return the most specific instruction for navigating
   * the application into the state specified by the url
   */
  abstract recognize(url: string, ancestorInstructions: Instruction[]): ng.IPromise<Instruction>

  /**
   * Given a normalized list with component names and params like: `['user', {id: 3 }]`
   * generates a url with a leading slash relative to the provided `parentComponent`.
   *
   * If the optional param `_aux` is `true`, then we generate starting at an auxiliary
   * route boundary.
   */
  abstract generate(linkParams: any[], ancestorInstructions: Instruction[], _aux?: boolean): Instruction

  abstract hasRoute(name: string, parentComponent: any): boolean

  abstract generateDefault(componentCursor: Type): Instruction


}
