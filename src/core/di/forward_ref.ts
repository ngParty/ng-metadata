import { stringify, isFunction } from '../../facade/lang';
import { Type } from '../../facade/type';


/**
 * An interface that a function passed into {@link forwardRef} has to implement.
 *
 * ### Example
 *
 * {@example core/di/ts/forward_ref/forward_ref.ts region='forward_ref_fn'}
 */
export interface ForwardRefFn {
  (): any;
  __forward_ref__?: Function,
  toString?():string
}

/**
 * Allows to refer to references which are not yet defined.
 *
 * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
 * DI is declared,
 * but not yet defined. It is also used when the `token` which we use when creating a query is not
 * yet defined.
 *
 * ### Example
 * {@example core/di/ts/forward_ref/forward_ref.ts region='forward_ref'}
 */
export function forwardRef(forwardRefFn: ForwardRefFn): Type {
  forwardRefFn.__forward_ref__ = forwardRef;
  forwardRefFn.toString = function() { return stringify(this()); };
  return forwardRefFn as any as Type;
}

/**
 * Lazily retrieves the reference value from a forwardRef.
 *
 * Acts as the identity function when given a non-forward-ref value.
 *
 * ### Example ([live demo](http://plnkr.co/edit/GU72mJrk1fiodChcmiDR?p=preview))
 *
 * ```typescript
 * var ref = forwardRef(() => "refValue");
 * expect(resolveForwardRef(ref)).toEqual("refValue");
 * expect(resolveForwardRef("regularValue")).toEqual("regularValue");
 * ```
 *
 * See: {@link forwardRef}
 */
export function resolveForwardRef<T>( type: ForwardRefFn| T ): T {

  if ( _isForwardRef( type ) ) {
    return (type as ForwardRefFn)();
  } else {
    return type;
  }

  function _isForwardRef( type ): type is ForwardRefFn {
    return isFunction( type ) && type.hasOwnProperty( '__forward_ref__' ) && type.__forward_ref__ === forwardRef
  }

}
