import {isBlank,stringify} from '../../facade/lang';
import {resolveForwardRef} from './forward_ref';
import {StringMapWrapper} from '../../facade/collections';
import {baseToString} from '../../facade/lang';
import {StringWrapper} from '../../facade/primitives';
import {isString} from '../../facade/lang';
import {OpaqueToken} from './opaque_token';
import {ListWrapper} from '../../facade/collections';
import {isType} from '../../facade/lang';
import {getTypeName} from '../../facade/lang';
import { Type } from '../../facade/type';

/**
 * @TODO
 * this module is not used, we can leverage the Key creation for
 * caching @Inject token to string names for performance
 */

/**
 * A unique object used for retrieving items from the {@link Injector}.
 *
 * Keys have:
 * - a system-wide unique `id`.
 * - a `token`.
 *
 * `Key` is used internally by {@link Injector} because its system-wide unique `id` allows the
 * injector to store created objects in a more efficient way.
 *
 * `Key` should not be created directly. {@link Injector} creates keys automatically when resolving
 * providers.
 */
//export class Key {
//  /**
//   * Private
//   */
//  constructor( public token: Object, public id: number ) {
//    if ( isBlank( token ) ) {
//      throw new Error( 'Token must be defined!' );
//    }
//  }
//
//  /**
//   * Returns a stringified token.
//   */
//  get displayName(): string { return stringify( this.token ); }
//
//  /**
//   * Retrieves a `Key` for a token.
//   */
//  static get( token: Object ): Key { return _globalKeyRegistry.get( resolveForwardRef( token ) ); }
//
//  /**
//   * @returns the number of keys registered in the system.
//   */
//  static get numberOfKeys(): number { return _globalKeyRegistry.numberOfKeys; }
//}

/**
 * @internal
 */
export class KeyRegistry {

  private static _suffix = `#`;

  private _allKeys: string[] = ListWrapper.create();
  private _idCounter: number = 0;

  //get( token: string | OpaqueToken | Type ): string {
  //  // Return it if it is already a string like `'$http'` or `'$state'`
  //  if(isString(token)) {
  //    return token;
  //  }
  //  if(token instanceof OpaqueToken){
  //    return token.desc;
  //  }
  //
  //  const tokenString = stringify( token );
  //  const hasToken = StringMapWrapper.contains( this._allKeys, tokenString );
  //
  //  if ( hasToken ) {
  //    return tokenString;
  //  }
  //
  //  const newKey = `${ tokenString }${ this._uniqueId() }`;
  //  StringMapWrapper.set( this._allKeys, newKey, token );
  //  return newKey;
  //}

  /**
   *
   * @param token
   * @returns {*}
   */
  get( token: Type ): string {
    if ( !isType( token ) ) {
      throw new Error( `KeyRegistry#get:
                        ================
                        you'v tried to create a key for \`${ token }\`
                        creating and getting key tokens is avaialable only for Type` );
    }
    const newKey = `${ getTypeName( token ) }${ KeyRegistry._suffix }${ this._uniqueId() }`;
    this._allKeys.push( newKey );

    return newKey;

  }

  get numberOfKeys(): number { return ListWrapper.size( this._allKeys ) }

  get allKeys(): Object { return ListWrapper.clone( this._allKeys ) }


  /**
   * just for testing purposes
   * @private
   * @internal
   */
  _reset() {
    ListWrapper.clear( this._allKeys );
    this._idCounter = 0;
  }

  /**
   * Generates a unique ID. If `prefix` is provided the ID is appended to it.
   *
   * @param {string} [prefix] The value to prefix the ID with.
   * @returns {string} Returns the unique ID.
   * @example
   *
   * _uniqueId('contact_');
   * // => 'contact_104'
   *
   * _uniqueId();
   * // => '105'
   */
  private _uniqueId( prefix?: string ) {
    const id = ++this._idCounter;
    return `${ baseToString( prefix ) }${ id }`;
  }

}

export const globalKeyRegistry = new KeyRegistry();
