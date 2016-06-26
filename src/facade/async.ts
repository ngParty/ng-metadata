import { noop } from './lang';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

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
 *   @Output() open = new EventEmitter<boolean>();
 *   @Output() close = new EventEmitter<boolean>();
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
export class EventEmitter<T> extends Subject<T> {
  // TODO: mark this as internal once all the facades are gone
  // we can't mark it as internal now because EventEmitter exported via @angular/core would not
  // contain this property making it incompatible with all the code that uses EventEmitter via
  // facades, which are local to the code and do not have this property stripped.
  // tslint:disable-next-line
  private __isAsync: boolean;


  /** @internal */
  private _ngExpressionBindingCb: ngEmitPayloadEvent<T> = noop;

  /**
   * Creates an instance of [EventEmitter], which depending on [isAsync],
   * delivers events synchronously or asynchronously.
   */
  constructor( isAsync: boolean = false ) {
    super();
    this.__isAsync = isAsync;
  }

  /** @internal */
  wrapNgExpBindingToEmitter( cb: Function ) {
    //used in reassignBindingsAndCreteEventEmitters to attach the original @Output binding to the instance new EventEmitter
    this._ngExpressionBindingCb = ( cb as ngEmitPayloadEvent<T> );
    // this could create memory leaks because the subscription would be never terminated
    // super.subscribe((newValue)=>this._ngExpressionBindingCb({$event:newValue}));
  }

  emit( value: T ) {
    const payload = { $event: value };
    // push just the value
    super.next( value );
    // our & binding needs to be called via { $event: value } because Angular 1 locals
    this._ngExpressionBindingCb( payload );
  }

  subscribe(generatorOrNext?: any, error?: any, complete?: any): Subscription {
    let schedulerFn: any /** TODO #9100 */;
    let errorFn = (err: any): any /** TODO #9100 */ => null;
    let completeFn = (): any /** TODO #9100 */ => null;

    if (generatorOrNext && typeof generatorOrNext === 'object') {
      schedulerFn = this.__isAsync
        ? (value: any /** TODO #9100 */) => { setTimeout(() => generatorOrNext.next(value)) }
        : (value: any /** TODO #9100 */) => { generatorOrNext.next(value) };

      if (generatorOrNext.error) {
        errorFn = this.__isAsync
          ? (err) => { setTimeout(() => generatorOrNext.error(err)) }
          : (err) => { generatorOrNext.error(err) };
      }
      if (generatorOrNext.complete) {
        completeFn = this.__isAsync
          ? () => { setTimeout(() => generatorOrNext.complete()) }
          : () => { generatorOrNext.complete() };
      }
    } else {
      schedulerFn = this.__isAsync
        ? (value: any /** TODO #9100 */) => { setTimeout(() => generatorOrNext(value))}
        : (value: any /** TODO #9100 */) => { generatorOrNext(value) };

      if (error) {
        errorFn = this.__isAsync ? (err) => { setTimeout(() => error(err)) } : (err) => { error(err) };
      }
      if (complete) {
        completeFn = this.__isAsync ? () => { setTimeout(() => complete()) } : () => { complete() };
      }
    }

    return super.subscribe( schedulerFn, errorFn, completeFn );
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
type ngEmitPayloadEvent<T> = ( $event: {$event: T} )=>void;

