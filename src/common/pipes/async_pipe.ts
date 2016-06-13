import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';


import { Pipe } from '../../core/pipes/decorators';
import { PipeTransform } from '../../core/pipes/pipe_interfaces';
import { isPromiseLike } from '../../facade/lang';
import { isObservable } from '../../facade/lang';
/**
 * Thanks to @cvuorinen for the angular1-async-filter
 * https://github.com/cvuorinen/angular1-async-filter
 */

type StoredSubscription = ng.IPromise<any>|ng.IHttpPromise<any>|Subscription;

@Pipe( { name: 'async'/*, pure: false*/ } )
export class AsyncPipe implements PipeTransform {

  // Need a way to tell the input objects apart from each other (so we only subscribe to them once)
  private static nextObjectID: number = 0;
  private static values: {[key: string]: any} = {};
  private static subscriptions: {[key: string]: StoredSubscription} = {};

  private static TRACK_PROP_NAME = '__asyncFilterObjectID__';

  private static objectId( obj: any ): any {
    if ( !obj.hasOwnProperty( AsyncPipe.TRACK_PROP_NAME ) ) {
      obj[ AsyncPipe.TRACK_PROP_NAME ] = ++AsyncPipe.nextObjectID;
    }
    return obj[ AsyncPipe.TRACK_PROP_NAME ];
  }

  private static isPromiseOrObservable( obj: any ): boolean {
    return isPromiseLike( obj ) || isObservable( obj );
  }

  private static getSubscriptionStrategy( input: any ): ( value ) => StoredSubscription {
    return input.subscribe && input.subscribe.bind( input )
      || input.success && input.success.bind( input ) // To make it work with HttpPromise
      || input.then.bind( input ); // To make it work with Promise
  }

  private static dispose( inputId: number ): void {
    if ( AsyncPipe.subscriptions[ inputId ] && (AsyncPipe.subscriptions[ inputId ] as Subscription).unsubscribe ) {
      (AsyncPipe.subscriptions[ inputId ] as Subscription).unsubscribe();
    }
    delete AsyncPipe.subscriptions[ inputId ];
    delete AsyncPipe.values[ inputId ];
  }

  transform( input: Observable<any>|ng.IPromise<any>|ng.IHttpPromise<any>, scope?: ng.IScope ): any {

    if ( !AsyncPipe.isPromiseOrObservable( input ) ) {
      return input
    }

    const inputId = AsyncPipe.objectId( input );

    // return cached immediately
    if ( inputId in AsyncPipe.subscriptions ) {
      return AsyncPipe.values[ inputId ] || undefined;
    }

    const subscriptionStrategy = AsyncPipe.getSubscriptionStrategy( input );
    AsyncPipe.subscriptions[ inputId ] = subscriptionStrategy( _setSubscriptionValue );

    if ( scope && scope.$on ) {
      // Clean up subscription and its last value when the scope is destroyed.
      scope.$on( '$destroy', () => { AsyncPipe.dispose( inputId ) } );
    }

    function _setSubscriptionValue( value: any ): void {
      AsyncPipe.values[ inputId ] = value;

      // this is needed only for Observables
      _markForCheck( scope );
    }

    function _markForCheck( scope: ng.IScope ) {
      if ( scope && scope.$applyAsync ) {
        // @TODO perfmatters we don't need to digest whole scope tree right?
        // scope.$applyAsync(); // Automatic safe apply, if scope provided
        scope.$digest(); // Automatic safe apply, if scope provided
      }
    }

  }
}
