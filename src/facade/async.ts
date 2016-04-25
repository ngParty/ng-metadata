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
 *   @Output() open: EventEmitter<boolean> // used as interface
 *   @Output() close: EventEmitter<boolean> = new EventEmitter();
 *
 *   toggle() {
 *     this.visible = !this.visible;
 *     if (this.visible) {
 *       this.open.emit( this.visible );
 *     } else {
 *       this.close.emit( this.visible );
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

  private _generatorOrNextFn: EventHandler<T>[] = [];
  private _ngExpressionBindingCb: _ngEmitPayloadEvent<T> = noop;

  /** @internal */
  static makeNgExpBindingEmittable<T>( cb: Function ) {
    //used in _createOutputBinding to attach statics methods on @Output bindings to behave as an EventEmitter
    const ee = ((cb as any) as EventEmitter<T>);
    ee._generatorOrNextFn = [];

    ee.emit = function ( value: T ) {
      EventEmitter.createEmit( value, ee, (cb as _ngEmitPayloadEvent<T>) );
    };

    ee._dispose = function ( cbRef: EventHandler<T> ) {
      EventEmitter.createDisposable( cbRef, ee )
    };

    ee.subscribe = function ( generatorOrNext?: EventHandler<T> ): Function {
      return EventEmitter.createSubscribe( generatorOrNext, ee );
    };
  }

  /** @internal */
  private static createDisposable<T>( cbRef: EventHandler<T>, _context: EventEmitter<T> ) {
    const refIdx = _context._generatorOrNextFn.indexOf(cbRef);
    if ( refIdx === -1 ) {
      return;
    }
    _context._generatorOrNextFn.splice( refIdx, 1 );
  }

  /** @internal */
  private static createEmit<T>( value:T, _context: EventEmitter<T>, exprBindingCb?: _ngEmitPayloadEvent<T> ) {
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
  private static createSubscribe<T>( generatorOrNext: EventHandler<T>, _context: EventEmitter<T> ): _Disposable {
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

  private _dispose( cbRef: EventHandler<T> ) {
    EventEmitter.createDisposable( cbRef, this );
  }

  /** @internal */
  wrapNgExpBindingToEmitter( cb: Function ) {
    //used in reassignBindingsAndCreteEventEmitters to attach the original @Output binding to the instance new EventEmitter
    this._ngExpressionBindingCb = ( cb as _ngEmitPayloadEvent<T> );
  }

  emit( value: T ) {
    EventEmitter.createEmit( value, this );
  }

  subscribe( generatorOrNext?: EventHandler<T>, error?: any, complete?: any ): Function {
    return EventEmitter.createSubscribe( generatorOrNext, this );
  }
}


/**
 * Use by parent component to mark a function as an handler of a custom Event
 * 
 *  ### Examples
 * 
 *  In the following esample, `ZParent` (parent component) handle `open` and `close` events emitted by `Zippy` (child component)
 * 
 * ```
 * @Component({
 *   selector: 'z-parent',
 *   template: `
 *   Content is visible? {{ $ctrl.zippyState }}
 *   <zippy open="$ctrl.showState($event)" close="$ctrl.showState($event)">
 *      Alternate <i>show</i> and <i>hide</i> of this <b>content</b> ... 
 *   </zippy>
 * `})
 * export class ZParent {
 *   public zippyState: boolean = true;
 *   public showState: EventHandler<boolean> = ( visible ) => {
 *      this.zippyState = visible; // HERE visibile is a boolean === $event passed from zippy child component events
 *   }  
 * }
 * ```
 */
export interface EventHandler<T> extends Function {
  ($event: T): void;
}

/** @internal */
interface _ngEmitPayloadEvent<T> extends Function {
  // signature for ngExpressionBindingCb to pass a standard payload $event 
  ({$event: T}): void;
}

/** @internal */
interface _Disposable extends Function {
  // signature for dispose method returned from .subscribe() to safely unsubscribe later
  ():void;
}

