var globalScope: BrowserNodeGlobal;

if ( typeof window === 'undefined' ) {
  globalScope = global as any;
} else {
  globalScope = window as any;
}


/** Used to match property names within property paths. */
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

/** Used to match backslashes in property paths. */
const reEscapeChar = /\\(\\)?/g;



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


export function CONST(): ClassDecorator & PropertyDecorator {
  return ( target ) => target;
}

export function isPresent( obj: any ): boolean {
  return obj !== undefined && obj !== null;
}

export function isBlank( obj: any ): boolean {
  return obj === undefined || obj === null;
}

export function isString( obj: any ): obj is String {
  return typeof obj === "string";
}

export function isFunction( obj: any ): boolean {
  return typeof obj === "function";
}

export function isArray( obj: any ): boolean {
  return Array.isArray( obj );
}

export function isNumber( obj ): boolean {
  return typeof obj === 'number';
}

export function isDate( obj ): boolean {
  return obj instanceof Date && !isNaN( obj.valueOf() );
}

export function isType( obj: any ): boolean {
  return isFunction( obj );
}

export function isStringMap( obj: any ): boolean {
  return typeof obj === 'object' && obj !== null;
}

export function isPromise(obj: any): boolean {
  return obj instanceof (<any>_global).Promise;
}

export function isJsObject( o: any ): boolean {
  return o !== null && (typeof o === "function" || typeof o === "object");
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

  const typeName = _getFuncName(type);
  return firstToLowerCase( typeName );

}

/**
 *
 * @param {Function}  func
 * @returns {string}
 * @private
 */
function _getFuncName( func: Function ): string {

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
