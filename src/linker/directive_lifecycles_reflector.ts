import {Type} from '../facade/lang';
import {LifecycleHooks} from './directive_lifecycle_interfaces';

export function hasLifecycleHook(lcInterface: LifecycleHooks, token: any): boolean {

  if (!(token instanceof Type)) return false;

  const proto = token.prototype;

  switch (lcInterface) {
    case LifecycleHooks.AfterContentInit:
      return !!proto.ngAfterContentInit;
    case LifecycleHooks.AfterViewInit:
      return !!proto.ngAfterViewInit;
    case LifecycleHooks.OnDestroy:
      return !!proto.ngOnDestroy;
    case LifecycleHooks.OnInit:
      return !!proto.ngOnInit;
    default:
      return false;
  }

}
