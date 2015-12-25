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

export function isString( obj: any ): boolean {
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
