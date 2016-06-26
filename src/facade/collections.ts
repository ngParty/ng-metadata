import {
  isPresent,
  isBlank,
  isFunction,
  toObject,
  toPath,
  isJsObject,
  isIndex,
  isKey,
  isArray,
  isArguments
} from './lang';


const INFINITY = 1 / 0;
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

  /**
   * The base implementation of `getValueFromPath` without support for string paths
   * and default values.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array} path The path of the property to get.
   * @param {string} [pathKey] The key representation of path.
   * @returns {*} Returns the resolved value.
   */
  static baseGet( object: Object, path: string[], pathKey?: string ) {
    if ( object == null ) {
      return;
    }
    object = toObject( object );
    if ( pathKey !== undefined && pathKey in object ) {
      path = [ pathKey ];
    }
    var index = 0,
      length = path.length;

    while ( object != null && index < length ) {
      object = toObject( object )[ path[ index++ ] ];
    }
    return (index && index == length)
      ? object
      : undefined;
  }

  /**
   * Gets the property value at `path` of `object`. If the resolved value is
   * `undefined` the `defaultValue` is used in its place.
   *
   * @static
   * @param {Object} object The object to query.
   * @param {Array|string} path The path of the property to get.
   * @param {*} [defaultValue] The value returned if the resolved value is `undefined`.
   * @returns {*} Returns the resolved value.
   * @example
   *
   * var object = { 'a': [{ 'b': { 'c': 3 } }] };
   *
   * _.get(object, 'a[0].b.c');
   * // => 3
   *
   * _.get(object, ['a', '0', 'b', 'c']);
   * // => 3
   *
   * _.get(object, 'a.b.c', 'default');
   * // => 'default'
   */
  static getValueFromPath( object: Object, path: string|any[], defaultValue? ) {
    var result = object == null
      ? undefined
      : StringMapWrapper.baseGet( object, toPath( path ), (path + '') );
    return result === undefined
      ? defaultValue
      : result;
  }

  /**
   * Sets the property value of `path` on `object`. If a portion of `path`
   * does not exist it's created.
   *
   * @static
   * @param {Object} object The object to augment.
   * @param {Array|string} path The path of the property to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns `object`.
   * @example
   *
   * var object = { 'a': [{ 'b': { 'c': 3 } }] };
   *
   * _.set(object, 'a[0].b.c', 4);
   * console.log(object.a[0].b.c);
   * // => 4
   *
   * _.set(object, 'x[0].y.z', 5);
   * console.log(object.x[0].y.z);
   * // => 5
   */
  static setValueInPath<O,M>( object: any, path: string|any[], value: any ): M {

    if ( object == null ) {
      return object;
    }
    var pathKey = (path + '');
    path = (object[ pathKey ] != null || isKey( path, object ))
      ? [ pathKey ]
      : toPath( path );

    var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;

    while ( nested != null && ++index < length ) {
      var key = path[ index ];
      if ( isJsObject( nested ) ) {
        if ( index == lastIndex ) {
          nested[ key ] = value;
        } else if ( nested[ key ] == null ) {
          nested[ key ] = isIndex( path[ index + 1 ] )
            ? []
            : {};
        }
      }
      nested = nested[ key ];
    }
    return object;
  }

  static get<V>( map: {[key: string]: V}, key: string ): V {
    return map.hasOwnProperty( key )
      ? map[ key ]
      : undefined;
  }

  static set<V>( map: {[key: string]: V}, key: string, value: V ) { map[ key ] = value; }

  static keys( map: {[key: string]: any} ): string[] { return Object.keys( map ); }

  static size( map: {[key: string]: any} ): number { return StringMapWrapper.keys( map ).length; }

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

  static values<T>( map: {[key: string]: T} ): T[] {
    return Object.keys( map ).reduce( ( r, a ) => {
      r.push( map[ a ] );
      return r;
    }, [] );
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

  static assign(target: any, ...sources: any[]): any {

    if ( !isPresent( target ) ) {
      throw new TypeError( 'Object.assign cannot be called with null or undefined' );
    }

    const hasOwnProperty = Object.prototype.hasOwnProperty;

    if ( (Object as any).assign ) {
      return (Object as any).assign( target, ...sources );
    }

    let from;
    const to = Object( target );

    for ( var s = 0; s < sources.length; s++ ) {

      from = Object( sources[ s ] );

      for ( var key in from ) {
        if ( hasOwnProperty.call( from, key ) ) {
          to[ key ] = from[ key ];
        }
      }

    }

    return to;

  }

}


/**
 * A boolean-valued function over a value, possibly including context information
 * regarding that value's position in an array.
 */
export interface Predicate<T> { ( value: T, index?: number, array?: T[] ): boolean; }

export class ListWrapper {

  static create(): any[] { return [] }

  static size( array: any[] ): number { return array.length }

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

  static fill( list: any[], value: any, start: number = 0, end: number = null ) {

    if ( !(Array.prototype as any).fill ) {
      (Array.prototype as any).fill = function ( value ) {

        // Steps 1-2.
        if ( this == null ) {
          throw new TypeError( 'this is null or not defined' );
        }

        var O = Object( this );

        // Steps 3-5.
        var len = O.length >>> 0;

        // Steps 6-7.
        var start = arguments[ 1 ];
        var relativeStart = start >> 0;

        // Step 8.
        var k = relativeStart < 0
          ? Math.max( len + relativeStart, 0 )
          : Math.min( relativeStart, len );

        // Steps 9-10.
        var end = arguments[ 2 ];
        var relativeEnd = end === undefined
          ? len
          : end >> 0;

        // Step 11.
        var final = relativeEnd < 0
          ? Math.max( len + relativeEnd, 0 )
          : Math.min( relativeEnd, len );

        // Step 12.
        while ( k < final ) {
          O[ k ] = value;
          k++;
        }

        // Step 13.
        return O;
      };
    }

    (list as any).fill(
      value,
      start,
      end === null
        ? list.length
        : end
    );

  }

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


  private static isFlattenable(value): boolean {
    return isArray(value) || isArguments(value);
  }

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */
  private static arrayPush( array: any[], values: any[] ): any[] {
    var index = -1,
      length = values.length,
      offset = array.length;

    while ( ++index < length ) {
      array[ offset + index ] = values[ index ];
    }
    return array;
  }
  /**
   * The base implementation of `_.flatten` with support for restricting flattening.
   *
   * @private
   * @param {Array} array The array to flatten.
   * @param {number} depth The maximum recursion depth.
   * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
   * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
   * @param {Array} [result=[]] The initial result value.
   * @returns {Array} Returns the new flattened array.
   */
  private static baseFlatten(
    array: any[],
    depth: number,
    predicate = ListWrapper.isFlattenable,
    isStrict = false,
    result = []
  ) {
    var index = -1;
    var length = array.length;

    while ( ++index < length ) {
      var value = array[ index ];
      if ( depth > 0 && predicate( value ) ) {
        if ( depth > 1 ) {
          // Recursively flatten arrays (susceptible to call stack limits).
          ListWrapper.baseFlatten( value, depth - 1, predicate, isStrict, result );
        } else {
          ListWrapper.arrayPush( result, value );
        }
      } else if ( !isStrict ) {
        result[ result.length ] = value;
      }
    }
    return result;
  }


  /**
   * Flattens `array` a single level deep.
   *
   * @static
   * @param {Array} array The array to flatten.
   * @returns {Array} Returns the new flattened array.
   * @example
   *
   * _.flatten([1, [2, [3, [4]], 5]]);
   * // => [1, 2, [3, [4]], 5]
   */
  static flatten(array: any[]): any[] {
    const length = array ? array.length : 0;
    return length ? ListWrapper.baseFlatten(array, 1) : [];
  }

  /**
   * Recursively flattens `array`.
   *
   * @static
   * @param {Array} array The array to flatten.
   * @returns {Array} Returns the new flattened array.
   * @example
   *
   * _.flattenDeep([1, [2, [3, [4]], 5]]);
   * // => [1, 2, 3, 4, 5]
   */
  static flattenDeep( array: any[] ): any[] {
    const length = array
      ? array.length
      : 0;
    return length
      ? ListWrapper.baseFlatten( array, INFINITY )
      : [];
  }

}
