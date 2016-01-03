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

export var Type = Function;

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


export function find(arr, predicate, ctx?) {
  if ( isFunction( Array.prototype[ 'find' ] ) ) {
    return arr.find( predicate, ctx );
  }

  ctx = ctx || this;
  var length = arr.length;
  var i;

  if (!isFunction(predicate)) {
    throw new TypeError(`${predicate} is not a function`);
  }

  for (i = 0; i < length; i++) {
    if (predicate.call(ctx, arr[i], i, arr)) {
      return arr[i];
    }
  }

  return undefined;

}

export function findIndex(arr, predicate, ctx?) {
  if (isFunction(Array.prototype['findIndex'])) {
    return arr.findIndex(predicate, ctx);
  }

  if (!isFunction(predicate)) {
    throw new TypeError('predicate must be a function');
  }

  var list = Object(arr);
  var len = list.length;

  if (len === 0) {
    return -1;
  }

  for (var i = 0; i < len; i++) {
    if (predicate.call(ctx, list[i], i, list)) {
      return i;
    }
  }

  return -1;
}
