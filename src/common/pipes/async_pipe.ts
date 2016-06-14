import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { Pipe } from '../../core/pipes/decorators';
import { PipeTransform } from '../../core/pipes/pipe_interfaces';

import { isObservable, isScope, isSubscription, isPromiseOrObservable } from '../../facade/lang';

type StoredSubscription = ng.IPromise<any>|ng.IHttpPromise<any>|Subscription;

/**
 * Based on @cvuorinen angular1-async-filter implementation
 * @link https://github.com/cvuorinen/angular1-async-filter
 *
 * The `async` pipe subscribes to an `Observable` or `Promise` and returns the latest value it has emitted.
 * When a new value is emitted, the `async` pipe marks the component to be checked for changes. ( runs $scope.$digest() )
 * When the component gets destroyed, the `async` pipe unsubscribes automatically to avoid potential memory leaks.
 *
 * ## Usage
 *
 *  object | async // for non observable
 *  object | async:this // for observable
 *
 * where:
 *  - `object` is one of type `Observable`, `Promise`, 'ng.IPromise' or 'ng.IHttpPromise'
 *  - `this` is pipe parameter ( in angular 1 reference to local $Scope ( we need for Observable disposal )
 *
 *  If you are using async with observables nad you don't provide scope we will throw Error to let you know that you forgot `this`, #perfmatters baby!
 *
 * ## Examples
 *
 * This example binds a `Promise` to the view. Clicking the `Resolve` button resolves the promise.
 *
 * {@example core/pipes/ts/async_pipe/async_pipe_example.ts region='AsyncPipePromise'}
 *
 * It's also possible to use `async` with Observables. The example below binds the `time` Observable
 * to the view. Every 500ms, the `time` Observable updates the view with the current time.
 *
 * {@example core/pipes/ts/async_pipe/async_pipe_example.ts region='AsyncPipeObservable'}
 */
@Pipe( { name: 'async'/*, pure: false*/ } )
export class AsyncPipe implements PipeTransform {

  // Need a way to tell the input objects apart from each other (so we only subscribe to them once)
  private static nextObjectID: number = 0;
  private static values: {[key: string]: any} = {};
  private static subscriptions: {[key: string]: StoredSubscription} = {};
  private static TRACK_PROP_NAME = '__asyncFilterObjectID__';

  private static _objectId( obj: any ): any {
    if ( !obj.hasOwnProperty( AsyncPipe.TRACK_PROP_NAME ) ) {
      obj[ AsyncPipe.TRACK_PROP_NAME ] = ++AsyncPipe.nextObjectID;
    }
    return obj[ AsyncPipe.TRACK_PROP_NAME ];
  }

  private static _getSubscriptionStrategy( input: any ): ( value ) => StoredSubscription {
    return input.subscribe && input.subscribe.bind( input )
      || input.success && input.success.bind( input ) // To make it work with HttpPromise
      || input.then.bind( input ); // To make it work with Promise
  }

  private static _markForCheck( scope: ng.IScope ) {
    if ( isScope( scope ) ) {
      // #perfmatters
      // wait till event loop is free and run just local digest so we don't get in conflict with other local $digest
      setTimeout( ()=>scope.$digest() );
      // we can't run local scope.$digest, because if we have multiple async pipes on the same scope 'infdig' error would occur :(
      // scope.$applyAsync(); // Automatic safe apply, if scope provided
    }
  }

  private static _dispose( inputId: number ): void {
    if ( isSubscription( AsyncPipe.subscriptions[ inputId ] ) ) {
      (AsyncPipe.subscriptions[ inputId ] as Subscription).unsubscribe();
    }
    delete AsyncPipe.subscriptions[ inputId ];
    delete AsyncPipe.values[ inputId ];
  }

  transform( input: Observable<any>|ng.IPromise<any>|ng.IHttpPromise<any>, scope?: ng.IScope ): any {

    if ( !isPromiseOrObservable( input ) ) {
      return input
    }

    if ( isObservable( input ) && !isScope( scope ) ) {
      throw new Error( 'AsyncPipe: you have to specify "this" as parameter so we can unsubscribe on scope.$destroy!' );
    }

    const inputId = AsyncPipe._objectId( input );

    // return cached immediately
    if ( inputId in AsyncPipe.subscriptions ) {
      return AsyncPipe.values[ inputId ] || undefined;
    }

    const subscriptionStrategy = AsyncPipe._getSubscriptionStrategy( input );
    AsyncPipe.subscriptions[ inputId ] = subscriptionStrategy( _setSubscriptionValue );

    if ( isScope( scope ) ) {
      // Clean up subscription and its last value when the scope is destroyed.
      scope.$on( '$destroy', () => { AsyncPipe._dispose( inputId ) } );
    }

    function _setSubscriptionValue( value: any ): void {
      AsyncPipe.values[ inputId ] = value;
      // this is needed only for Observables
      AsyncPipe._markForCheck( scope );
    }

  }
}
