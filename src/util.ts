import {isPipe,isDirective} from './directives';

const ATTRS_BOUNDARIES = /\[|\]/g;
const COMPONENT_SELECTOR = /^\[?[\w|-]*\]?$/;
const SKEWER_CASE = /-(\w)/g;

export function makeSelector( selector: string ): string {

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

  if ( typeof obj == 'function' ) {
    return obj.name || obj.toString();
  }
  return '' + obj;

}
export function provide(
  Type: any, {as}:{
    as?: string
  }={}
) {

  if ( isPipe( Type ) ) {
    return Type.pipeName;
  }
  if ( isDirective( Type ) ) {
    return makeSelector( Type.selector );
  }

  return _provideService( Type, as );

  function _provideService( Type, alias?: string ) {

    if ( alias ) {

      return alias;

    }

    const serviceName = stringify( Type );
    return serviceName.charAt( 0 ).toLowerCase() + serviceName.substring( 1 );

  }

}

export type AppRootArg = string | Element | Document;
export function bootstrap(
  ngModule: ng.IModule,
  {element=document,strictDi=true}:{
    element?: AppRootArg,
    strictDi?: boolean
  }
) {

  const appRoot = _getAppRoot( element );

  angular.element( document ).ready( ()=> {
    angular.bootstrap( appRoot, [ ngModule.name ], {
      strictDi: true
    } )
  } );

  function _getAppRoot( element: AppRootArg ): Element {

    if ( typeof element === 'string' ) {
      return document.querySelector( element );
    }
    return element as Element;

  }

}

export function controllerKey( name: string ): string {
  return '$' + name + 'Controller';
}


export function hasInjectables( Type ) {
  return (Array.isArray( Type.$inject ) && Type.$inject.length !== 0);
}
