/**
 * @internal
 */
export enum LifecycleHooks {
  OnInit,
  OnDestroy,
  AfterContentInit
}

const LIFECYCLE_HOOKS_VALUES = [
  LifecycleHooks.OnInit,
  LifecycleHooks.OnDestroy,
  LifecycleHooks.AfterContentInit
];

const METHOD_PREFIX = 'ng';

/**
 * Lifecycle hooks are guaranteed to be called in the following order:
 * - `OnInit` (from directive preLink),
 * - `AfterContentInit` ( from directvie postLink -> all children are rendered and has scope resolved),
 * - `OnDestroy` (at the very end before destruction, on $scope.$on('$destroy'))
 */


/**
 * Implement this interface to execute custom initialization logic after your directive's
 * data-bound properties have been initialized.
 *
 * `ngOnInit` is called right after the directive's data-bound properties have been checked for the
 * first time, and before any of its children have been checked. 
 * It is invoked only once when the directive is instantiated. 
 * 
 * In angular 1 terms, this method is invoked from `preLink` 
 * @TODO implement this @martin
 */
export interface OnInit { ngOnInit( args? ) }

/**
 * Implement this interface to get notified when your directive's content and view has been fully
 * initialized.
 */
export interface AfterContentInit { ngAfterContentInit( controllers?: any[] ) }

/**
 * Implement this interface to get notified when your directive is destroyed.
 *
 * `ngOnDestroy` callback is typically used for any custom cleanup that needs to occur when the
 * instance(directive) is destroyed
 * 
 * In anglualr 1 terms, it's invoked when `$scope.$destroy()` is called.
 */
export interface OnDestroy { ngOnDestroy( args? ) }


/**
 * helper method which gets method which needst to be implemented 
 * by used interface
 */
export function getLifecycleMethod( hook: number ): string {
  
  const lifeCycleHookName = LifecycleHooks[ hook ];
  return `${ METHOD_PREFIX }${ lifeCycleHookName }`;
  
}
