import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

export interface BrowserNodeGlobal {
  Object: typeof Object,
  Array: typeof Array,
  //Map: typeof Map,
  //Set: typeof Set,
  Date: typeof Date,
  RegExp: typeof RegExp,
  JSON: typeof JSON,
  Math: typeof Math,
  angular: angular.IAngularStatic,
  //assert(condition: any): void,
  Reflect: any,
  //zone: Zone,
  //getAngularTestability: Function,
  //getAllAngularTestabilities: Function,
  setTimeout: Function,
  clearTimeout: Function,
  setInterval: Function,
  clearInterval: Function
}

var globalScope: BrowserNodeGlobal;

if ( typeof window === 'undefined' ) {
  globalScope = global as any;
} else {
  globalScope = window as any;
}

// Need to declare a new variable for global here since TypeScript
// exports the original value of the symbol.
var _global: BrowserNodeGlobal = globalScope;

export {_global as global};

export const Type = Function;

/**
 * Runtime representation a type that a Component or other object is instances of.
 *
 * An example of a `Type` is `MyCustomComponent` class, which in JavaScript is be represented by
 * the `MyCustomComponent` constructor function.
 */
export interface Type extends Function {}

/**
 * Runtime representation of a type that is constructable (non-abstract).
 */
export interface ConcreteType extends Type { new (...args): any; }


// ===============
// implementations
// ===============

/** Used to match property names within property paths. */
const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/;
const reIsPlainProp = /^\w*$/;
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

/** Used to match backslashes in property paths. */
const reEscapeChar = /\\(\\)?/g;

/** Used to detect unsigned integer values. */
const reIsUint = /^\d+$/;

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
const MAX_SAFE_INTEGER = 9007199254740991;

const argsTag = '[object Arguments]';


let _devMode: boolean = true;
/**
 * Disable Angular's development mode, which turns off assertions and other
 * checks within the framework.
 *
 * One important assertion this disables verifies that a change detection pass
 * does not result in additional changes to any bindings (also known as
 * unidirectional data flow).
 */
export function enableProdMode() {
  _devMode = false;
}

export function assertionsEnabled(): boolean {
  return _devMode;
}

export function isPresent( obj: any ): boolean {
  return obj !== undefined && obj !== null;
}

export function isBlank( obj: any ): boolean {
  return obj === undefined || obj === null;
}

export function isString( obj: any ): obj is string {
  return typeof obj === "string";
}

export function isFunction( obj: any ): obj is Function {
  return typeof obj === "function";
}
export function isBoolean( obj: any ): obj is boolean {
  return typeof obj === "boolean";
}

export function isArray( obj: any ): obj is Array<any> {
  return Array.isArray( obj );
}

export function isNumber( obj: any ): obj is number {
  return typeof obj === 'number';
}

export function isDate( obj: any ): obj is Date {
  return obj instanceof Date && !isNaN( obj.valueOf() );
}

export function isType( obj: any ): obj is Type {
  return isFunction( obj );
}

export function isStringMap( obj: any ): obj is Object {
  return typeof obj === 'object' && obj !== null;
}

export function isPromise(obj: any): boolean {
  return obj instanceof (<any>_global).Promise;
}

export function isPromiseLike( obj: any ): boolean {
  return Boolean( isPresent( obj ) && obj.then );
}

export function isObservable<T>( obj: any ): obj is Observable<T> {
  return Boolean( isPresent( obj ) && obj.subscribe );
}

export function isPromiseOrObservable( obj: any ): boolean {
  return isPromiseLike( obj ) || isObservable( obj );
}

export function isScope( obj: any ): obj is ng.IScope {
  return isPresent( obj ) && obj.$digest && obj.$on;
}

export function isSubscription( obj: any ): obj is Subscription {
  return isPresent( obj ) && obj.unsubscribe;
}

export function isJsObject( o: any ): boolean {
  return o !== null && (typeof o === "function" || typeof o === "object");
}

export function isArguments(value: any): boolean {
  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
  return ('length' in value) && Object.prototype.hasOwnProperty.call(value, 'callee') &&
    (!Object.prototype.propertyIsEnumerable.call(value, 'callee') || Object.prototype.toString.call(value) == argsTag);
}

export function noop() {}

export function stringify( token ): string {
  if ( typeof token === 'string' ) {
    return token;
  }

  if ( token === undefined || token === null ) {
    return '' + token;
  }

  if ( token.name ) {
    return token.name;
  }

  var res = token.toString();
  var newLineIndex = res.indexOf( "\n" );
  return (newLineIndex === -1)
    ? res
    : res.substring( 0, newLineIndex );
}

/**
 * Converts `value` to a string if it's not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
export function baseToString(value:any): string {
  return value == null ? '' : (value + '');
}
/**
 * Converts `value` to property path array if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Array} Returns the property path array.
 */
export function toPath(value:any): any[] {
  if (isArray(value)) {
    return value;
  }
  //return value.split('.');
  const result = [];
  baseToString( value ).replace( rePropName, ( match, number, quote, string )=> {
    const resultValue = quote
      ? string.replace( reEscapeChar, '$1' )
      : (number || match);
    result.push( resultValue );
    return resultValue;
  } );
  return result;
}

export function assign( destination: any, ...sources: any[] ): any {

  const envAssign = _global.Object['assign'] || _global.angular.extend;

  return envAssign( destination, ...sources );

}

const ATTRS_BOUNDARIES = /\[|\]/g;
const COMPONENT_SELECTOR = /^\[?[\w|-]*\]?$/;
const SKEWER_CASE = /-(\w)/g;

export function resolveDirectiveNameFromSelector( selector: string ): string {

  if ( !selector.match( COMPONENT_SELECTOR ) ) {
    throw new Error(
      `Only selectors matching element names or base attributes are supported, got: ${selector}`
    );
  }

  return selector
    .trim()
    .replace(
      ATTRS_BOUNDARIES,
      ''
    )
    .replace(
      SKEWER_CASE,
      ( all, letter ) => letter.toUpperCase()
    )
}

export function getTypeName(type): string{

  const typeName = getFuncName(type);
  return firstToLowerCase( typeName );

}

/**
 *
 * @param {Function}  func
 * @returns {string}
 * @private
 */
export function getFuncName( func: Function ): string {

  const parsedFnStatement = /function\s*([^\s(]+)/.exec(stringify(func));
  const [,name=''] = parsedFnStatement || [];

  // if Function.name doesn't exist exec will find match otherwise return name property
  return name || stringify(func);

}

/**
 * controller instance of directive is exposed on jqLiteElement.data()
 * under the name: `$` + Ctor + `Controller`
 * @param name
 * @returns {string}
 */
export function controllerKey( name: string ): string {
  return '$' + name + 'Controller';
}
export function hasCtorInjectables( Type ): boolean {
  return (Array.isArray( Type.$inject ) && Type.$inject.length !== 0);
}
export function firstToLowerCase( value: string ): string {
  return _firstTo(value,String.prototype.toLowerCase);
}
export function firstToUpperCase( value: string ): string {
  return _firstTo(value,String.prototype.toUpperCase);
}
function _firstTo( value: string, cb: Function ): string {
  return cb.call( value.charAt( 0 ) ) + value.substring( 1 );
}

export function normalizeBlank(obj: Object): any {
  return isBlank(obj) ? null : obj;
}

export function normalizeBool(obj: boolean): boolean {
  return isBlank(obj) ? false : obj;
}

export function print(obj: Error | Object) {
  console.log(obj);
}

/**
 * Angular 2 setValueOnPath
 * supports only `.` path separator
 * @param global
 * @param path
 * @param value
 */
export function setValueOnPath(global: any, path: string, value: any) {
  var parts = path.split('.');
  var obj: any = global;
  while (parts.length > 1) {
    var name = parts.shift();
    if (obj.hasOwnProperty(name) && isPresent(obj[name])) {
      obj = obj[name];
    } else {
      obj = obj[name] = {};
    }
  }
  if (obj === undefined || obj === null) {
    obj = {};
  }
  obj[parts.shift()] = value;
}

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
export function toObject( value ): Object|Function {
  return isJsObject( value )
    ? value
    : Object( value );
}


/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
export function isIndex( value: any, length: number = MAX_SAFE_INTEGER ): boolean {
  value = (isNumber( value ) || reIsUint.test( value ))
    ? +value
    : -1;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
export function isKey( value: any, object: Object ): boolean {

  if ( (isString( value ) && reIsPlainProp.test( value )) || isNumber( value ) ) {
    return true;
  }
  if ( isArray( value ) ) {
    return false;
  }
  var result = !reIsDeepProp.test( value );
  return result || (object != null && value in toObject( object ));

}
