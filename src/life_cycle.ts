import {firstLowerCase} from './util';

export interface OnInit { onInit( args? ) }
export interface OnDestroy { onDestroy( args? ) }
export interface AfterContentInit { afterContentInit( args?: any[] ) }

export enum LifecycleHooks {
  OnInit,
  OnDestroy,
  AfterContentInit
}

/**
 * @internal
 */
const LIFECYCLE_HOOKS_VALUES = [
  LifecycleHooks.OnInit,
  LifecycleHooks.OnDestroy,
  LifecycleHooks.AfterContentInit
];

export function getLifecycleMethod( hook: number ): string {
  const lifeCycleHookName = LifecycleHooks[ hook ];
  return firstLowerCase( lifeCycleHookName );
}
