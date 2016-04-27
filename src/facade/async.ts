import { noop } from './lang';
import { isFunction } from './lang';
/**
 * Use by directives and components to emit custom Events.
 *
 * ### Examples
 *
 * In the following example, `ZippyComponent` alternatively emits `open` and `close` events when its
 * title gets clicked:
 *
 * ```
 * @Component({
 *   selector: 'zippy',
 *   template: `
 *   <div class="zippy">
 *     <div ng-click="$ctrl.toggle()">Toggle</div>
 *     <div ng-hide="!$ctrl.visible">
 *       <ng-transclude></ng-transclude>
 *     </div>
 *  </div>`
 * })
 * export class ZippyComponent {
 *   visible: boolean = true;
 * 
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
  private _ngExpressionBindingCb: ngEmitPayloadEvent<T> = noop;

  /** @internal */
  static makeNgExpBindingEmittable<T>( cb: Function ) {
    //used in _createOutputBinding to attach statics methods on @Output bindings to behave as an EventEmitter
    const ee = ((cb as any) as EventEmitter<T>);
    ee._generatorOrNextFn = [];

    ee.emit = function ( value: T ) {
      EventEmitter.createEmit( value, ee, (cb as ngEmitPayloadEvent<T>) );
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
  private static createEmit<T>( value:T, _context: EventEmitter<T>, exprBindingCb?: ngEmitPayloadEvent<T> ) {
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
  private static createSubscribe<T>( generatorOrNext: EventHandler<T>, _context: EventEmitter<T> ): Disposable {
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
    this._ngExpressionBindingCb = ( cb as ngEmitPayloadEvent<T> );
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
 *  In the following esample, `AppComponent` (parent component) handle `open` and `close` events emitted by `Zippy` (child component)
 * 
 * ```
 * @Component({
 *   selector: 'app',
 *   template: `<zippy open="$ctrl.onOpen($event)" close="$ctrl.onClose($event)"></zippy>`,
 *   directives: [ZippyComponent]
 * })
 * export class AppComponent {
 * 
 *   onOpen(zippyVisible: boolean) {
 *     // Event handler declared as simple method accepting single typed param  
 *     console.log(`zippy visibility is: ${zippyVisible}`);
 *   }
 *   public onClose: EventHandler<boolean> = ( zippyVisible ) => {
 *     // Event handler declared using explict EventHandler interface specifing the type of the param
 *     console.log(`zippy visibility is: ${zippyVisible}`); // HERE zippyVisibile is a boolean === $event passed from zippy child component
 *   }  
 * }
 * ```
 */
export interface EventHandler<T> extends Function {
  ($event: T): void;
}

/** @internal */
interface ngEmitPayloadEvent<T> extends Function {
  // signature for ngExpressionBindingCb to pass a standard payload $event 
  ({$event: T}): void;
}

/** @internal */
interface Disposable extends Function {
  // signature for dispose method returned from .subscribe() to safely unsubscribe later
  ():void;
}

