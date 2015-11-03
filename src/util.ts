import {isPipe} from './directives';

const ATTRS_BOUNDARIES = /\[|\]/g;
const COMPONENT_SELECTOR = /^\[?[\w|-]*\]?$/;
const SKEWER_CASE = /-(\w)/g;

export function makeSelector( Type: any ): string {

  const selector: string = Type.selector;

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

export function stringify( obj: any ): string {
  if ( isPipe(obj) ) {
    return obj.pipeName;
  }
  if ( typeof obj == 'function' ) {
    return obj.name || obj.toString();
  }
  return '' + obj;
}

export function controllerKey( name: string ): string {
  return '$' + name + 'Controller';
}


export function hasInjectables( Type ) {
  return (Array.isArray( Type.$inject ) && Type.$inject.length !== 0);
}
