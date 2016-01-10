import {isBlank,stringify} from '../facade/lang';
import {resolveForwardRef} from './forward_ref';
import {StringMapWrapper} from '../facade/collections';

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
export class Key {
  /**
   * Private
   */
  constructor( public token: Object, public id: number ) {
    if ( isBlank( token ) ) {
      throw new Error( 'Token must be defined!' );
    }
  }

  /**
   * Returns a stringified token.
   */
  get displayName(): string { return stringify( this.token ); }

  /**
   * Retrieves a `Key` for a token.
   */
  static get( token: Object ): Key { return _globalKeyRegistry.get( resolveForwardRef( token ) ); }

  /**
   * @returns the number of keys registered in the system.
   */
  static get numberOfKeys(): number { return _globalKeyRegistry.numberOfKeys; }
}

/**
 * @internal
 */
export class KeyRegistry {

  private _allKeys = StringMapWrapper.create();

  get( token: Object ): Key {
    if ( token instanceof Key ) return token;

    const tokenString = stringify( token );

    const getToken = StringMapWrapper.get( this._allKeys, tokenString );
    if ( getToken ) {
      return getToken;
    }

    const newKey = new Key( token, Key.numberOfKeys );
    StringMapWrapper.set( this._allKeys, tokenString, newKey );
    return newKey;
  }

  get numberOfKeys(): number { return StringMapWrapper.size( this._allKeys ) }
}

const _globalKeyRegistry = new KeyRegistry();
