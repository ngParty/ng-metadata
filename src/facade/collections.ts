import {isPresent,isBlank,isFunction} from "./lang";
/**
 * Wraps Javascript Objects
 */
export class StringMapWrapper {
  static create(): {[k: /*any*/ string]: any} {
    // Note: We are not using Object.create(null) here due to
    // performance!
    // http://jsperf.com/ng2-object-create-null
    return {};
  }

  static contains( map: {[key: string]: any}, key: string ): boolean {
    return map.hasOwnProperty( key );
  }

  static get<V>( map: {[key: string]: V}, key: string ): V {
    return map.hasOwnProperty( key )
      ? map[ key ]
      : undefined;
  }

  static set<V>( map: {[key: string]: V}, key: string, value: V ) { map[ key ] = value; }

  static keys( map: {[key: string]: any} ): string[] { return Object.keys( map ); }

  static isEmpty( map: {[key: string]: any} ): boolean {
    for ( var prop in map ) {
      return false;
    }
    return true;
  }

  static delete( map: {[key: string]: any}, key: string ) { delete map[ key ]; }

  static forEach<K, V>( map: {[key: string]: V}, callback: /*(V, K) => void*/ Function ) {
    for ( var prop in map ) {
      if ( map.hasOwnProperty( prop ) ) {
        callback( map[ prop ], prop );
      }
    }
  }

  static values<K, V>( map: {[key: string]: V} ): V[] {

    const values = [];
    StringMapWrapper.forEach( map, ( value )=> {
      values.push( value );
    } );

    return values;

  }

  static merge<V>( m1: {[key: string]: V}, m2: {[key: string]: V} ): {[key: string]: V} {
    var m: {[key: string]: V} = {};

    for ( var attr in m1 ) {
      if ( m1.hasOwnProperty( attr ) ) {
        m[ attr ] = m1[ attr ];
      }
    }

    for ( var attr in m2 ) {
      if ( m2.hasOwnProperty( attr ) ) {
        m[ attr ] = m2[ attr ];
      }
    }

    return m;
  }

  static equals<V>( m1: {[key: string]: V}, m2: {[key: string]: V} ): boolean {
    var k1 = Object.keys( m1 );
    var k2 = Object.keys( m2 );
    if ( k1.length != k2.length ) {
      return false;
    }
    var key;
    for ( var i = 0; i < k1.length; i++ ) {
      key = k1[ i ];
      if ( m1[ key ] !== m2[ key ] ) {
        return false;
      }
    }
    return true;
  }

}


/**
 * A boolean-valued function over a value, possibly including context information
 * regarding that value's position in an array.
 */
export interface Predicate<T> { ( value: T, index?: number, array?: T[] ): boolean; }

export class ListWrapper {
  // JS has no way to express a statically fixed size list, but dart does so we
  // keep both methods.
  static createFixedSize( size: number ): any[] { return new Array( size ); }

  static createGrowableSize( size: number ): any[] { return new Array( size ); }

  static clone<T>( array: T[] ): T[] { return array.slice( 0 ); }

  static forEachWithIndex<T>( array: T[], fn: ( t: T, n: number ) => void ) {
    for ( var i = 0; i < array.length; i++ ) {
      fn( array[ i ], i );
    }
  }

  static first<T>( array: T[] ): T {
    if ( !array ) return null;
    return array[ 0 ];
  }

  static last<T>( array: T[] ): T {
    if ( !array || array.length == 0 ) return null;
    return array[ array.length - 1 ];
  }

  static indexOf<T>( array: T[], value: T, startIndex: number = 0 ): number {
    return array.indexOf( value, startIndex );
  }

  static contains<T>( list: T[], el: T ): boolean { return list.indexOf( el ) !== -1; }

  static reversed<T>( array: T[] ): T[] {
    var a = ListWrapper.clone( array );
    return a.reverse();
  }

  static concat( a: any[], b: any[] ): any[] { return a.concat( b ); }

  static insert<T>( list: T[], index: number, value: T ) { list.splice( index, 0, value ); }

  static removeAt<T>( list: T[], index: number ): T {
    var res = list[ index ];
    list.splice( index, 1 );
    return res;
  }

  static removeAll<T>( list: T[], items: T[] ) {
    for ( var i = 0; i < items.length; ++i ) {
      var index = list.indexOf( items[ i ] );
      list.splice( index, 1 );
    }
  }

  static remove<T>( list: T[], el: T ): boolean {
    var index = list.indexOf( el );
    if ( index > -1 ) {
      list.splice( index, 1 );
      return true;
    }
    return false;
  }

  static clear( list: any[] ) { list.length = 0; }

  static isEmpty( list: any[] ): boolean { return list.length == 0; }

  //static fill(list: any[], value: any, start: number = 0, end: number = null) {
  //  list.fill(value, start, end === null ? list.length : end);
  //}
  static equals( a: any[], b: any[] ): boolean {
    if ( a.length != b.length ) return false;
    for ( var i = 0; i < a.length; ++i ) {
      if ( a[ i ] !== b[ i ] ) return false;
    }
    return true;
  }

  static slice<T>( l: T[], from: number = 0, to: number = null ): T[] {
    return l.slice( from,
      to === null
        ? undefined
        : to );
  }

  static splice<T>( l: T[], from: number, length: number ): T[] { return l.splice( from, length ); }

  static sort<T>( l: T[], compareFn?: ( a: T, b: T ) => number ) {
    if ( isPresent( compareFn ) ) {
      l.sort( compareFn );
    } else {
      l.sort();
    }
  }

  static toString<T>( l: T[] ): string { return l.toString(); }

  static toJSON<T>( l: T[] ): string { return JSON.stringify( l ); }

  static maximum<T>( list: T[], predicate: ( t: T ) => number ): T {
    if ( list.length == 0 ) {
      return null;
    }
    var solution = null;
    var maxValue = -Infinity;
    for ( var index = 0; index < list.length; index++ ) {
      var candidate = list[ index ];
      if ( isBlank( candidate ) ) {
        continue;
      }
      var candidateValue = predicate( candidate );
      if ( candidateValue > maxValue ) {
        solution = candidate;
        maxValue = candidateValue;
      }
    }
    return solution;
  }

  static find( arr, predicate, ctx? ): any {

    if ( isFunction( Array.prototype[ 'find' ] ) ) {
      return arr.find( predicate, ctx );
    }

    ctx = ctx || this;
    var length = arr.length;
    var i;

    if ( !isFunction( predicate ) ) {
      throw new TypeError( `${predicate} is not a function` );
    }

    for ( i = 0; i < length; i++ ) {
      if ( predicate.call( ctx, arr[ i ], i, arr ) ) {
        return arr[ i ];
      }
    }

    return undefined;

  }

  static findIndex( arr, predicate, ctx? ): number {

    if ( isFunction( Array.prototype[ 'findIndex' ] ) ) {
      return arr.findIndex( predicate, ctx );
    }

    if ( !isFunction( predicate ) ) {
      throw new TypeError( 'predicate must be a function' );
    }

    var list = Object( arr );
    var len = list.length;

    if ( len === 0 ) {
      return -1;
    }

    for ( var i = 0; i < len; i++ ) {
      if ( predicate.call( ctx, list[ i ], i, list ) ) {
        return i;
      }
    }

    return -1;
  }

}
