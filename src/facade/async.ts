import { noop } from './lang';
import { isFunction } from './lang';
/**
 * Use by directives and components to emit custom Events.
 *
 * ### Examples
 *
 * In the following example, `Zippy` alternatively emits `open` and `close` events when its
 * title gets clicked:
 *
 * ```
 * @Component({
 *   selector: 'zippy',
 *   template: `
 *   <div class="zippy">
 *     <div (click)="toggle()">Toggle</div>
 *     <div [hidden]="!visible">
 *       <ng-content></ng-content>
 *     </div>
 *  </div>`})
 * export class Zippy {
 *   visible: boolean = true;
 *   @Output() open: EventEmitter<any> = new EventEmitter();
 *   @Output() close: EventEmitter<any> = new EventEmitter();
 *
 *   toggle() {
 *     this.visible = !this.visible;
 *     if (this.visible) {
 *       this.open.emit(null);
 *     } else {
 *       this.close.emit(null);
 *     }
 *   }
 * }
 * ```
 *
 * Use Rx.Observable but provides an adapter to make it work as specified here:
 * https://github.com/jhusain/observable-spec
 *
 * Once a reference implementation of the spec is available, switch to it.
 */
export class EventEmitter<T> {
  /** @internal */
  _isAsync: boolean;

  private _generatorOrNextFn: Function[] = [];
  private _ngExpressionBindingCb: Function = noop;

  /** @internal */
  static makeNgExpBindingEmittable( cb: Function ) {
    (cb as any)._generatorOrNextFn = [];

    (cb as any).emit = function ( value: any ) {
      EventEmitter.createEmit( value, cb, cb );
    };

    (cb as any)._dispose = function ( cbRef ) {
      EventEmitter.createDisposable( cbRef, cb )
    };

    (cb as any).subscribe = function ( generatorOrNext?: Function ): Function {
      return EventEmitter.createSubscribe( generatorOrNext, cb );
    };
  }

  /** @internal */
  private static createDisposable( cbRef, _context: any ) {
    const refIdx = _context._generatorOrNextFn.indexOf( cbRef );
    if ( refIdx === -1 ) {
      return;
    }
    _context._generatorOrNextFn.splice( refIdx, 1 );
  }

  /** @internal */
  private static createEmit( value, _context: any, exprBindingCb?: Function ) {
    const payload = { $event: value };

    if ( isFunction( exprBindingCb ) ) {
      exprBindingCb( payload );
    } else {
      _context._ngExpressionBindingCb( payload );
    }

    // notify all subscribers
    _context._generatorOrNextFn.forEach( observerFn => observerFn( value ) );
  }

  /** @internal */
  private static createSubscribe( generatorOrNext, _context: any ): Function {
    console.warn( 'NOTE: This is not a real Observable!' );
    _context._generatorOrNextFn.push( generatorOrNext );

    return () => _context._dispose( generatorOrNext );
  }


  /**
   * Creates an instance of [EventEmitter], which depending on [isAsync],
   * delivers events synchronously or asynchronously.
   */
  constructor( isAsync: boolean = true ) {
    this._isAsync = isAsync;
  }

  private _dispose( cbRef ) {
    EventEmitter.createDisposable( cbRef, this );
  }

  /** @internal */
  wrapNgExpBindingToEmitter( cb: Function ) {
    this._ngExpressionBindingCb = cb;
  }

  emit( value: T ) {
    EventEmitter.createEmit( value, this );
  }

  subscribe( generatorOrNext?: Function, error?: any, complete?: any ): Function {
    return EventEmitter.createSubscribe( generatorOrNext, this );
  }
}
