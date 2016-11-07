import { Type } from '../../facade/type';
import { LifecycleHooks } from './directive_lifecycle_interfaces';

export function hasLifecycleHook(lcInterface: LifecycleHooks, token: any): boolean {

  if (!(token instanceof Type)) return false;

  const proto = token.prototype;

  switch (lcInterface) {
    case LifecycleHooks.AfterContentInit:
      return !!proto.ngAfterContentInit;
    case LifecycleHooks.AfterContentChecked:
      return !!proto.ngAfterContentChecked;
    case LifecycleHooks.AfterViewInit:
      return !!proto.ngAfterViewInit;
    case LifecycleHooks.AfterViewChecked:
      return !!proto.ngAfterViewChecked;
    case LifecycleHooks.OnDestroy:
      return !!proto.ngOnDestroy;
    case LifecycleHooks.OnInit:
      return !!proto.ngOnInit;
    case LifecycleHooks.OnChanges:
      return !!proto.ngOnChanges;
    case LifecycleHooks.DoCheck:
      return !!proto.ngDoCheck;
    case LifecycleHooks._OnChildrenChanged:
      return !!proto._ngOnChildrenChanged;
    default:
      return false;
  }

}


export type ImplementedLifeCycleHooks = {
  ngOnInit: boolean,
  ngOnChanges: boolean,
  ngDoCheck: boolean,
  ngAfterContentInit: boolean,
  ngAfterContentChecked: boolean,
  ngAfterViewInit: boolean,
  ngAfterViewChecked: boolean,
  ngOnDestroy: boolean,
  _ngOnChildrenChanged: boolean
}

/**
 * @internal
 */
export function resolveImplementedLifeCycleHooks( type: Type ): ImplementedLifeCycleHooks {
  return {
    ngOnInit: hasLifecycleHook( LifecycleHooks.OnInit, type ),
    ngOnChanges: hasLifecycleHook( LifecycleHooks.OnChanges, type ),
    ngDoCheck: hasLifecycleHook( LifecycleHooks.DoCheck, type ),
    ngAfterContentInit: hasLifecycleHook( LifecycleHooks.AfterContentInit, type ),
    ngAfterContentChecked: hasLifecycleHook( LifecycleHooks.AfterContentChecked, type ),
    ngAfterViewInit: hasLifecycleHook( LifecycleHooks.AfterViewInit, type ),
    ngAfterViewChecked: hasLifecycleHook( LifecycleHooks.AfterViewChecked, type ),
    ngOnDestroy: hasLifecycleHook( LifecycleHooks.OnDestroy, type ),
    _ngOnChildrenChanged: hasLifecycleHook( LifecycleHooks._OnChildrenChanged, type )
  }
}
