export type AppRoot = string | Element | Document;

/**
 * bootstrap angular app
 * @param {ng.IModule}  ngModule
 * @param {string | Element | Document} [element=document]
 * @param {boolean} [strictDi=true]
 */
export function bootstrap(
  ngModule: ng.IModule,
  {element=document,strictDi=true}:{
    element?: AppRoot,
    strictDi?: boolean
  }
) {

  const appRoot = _getAppRoot( element );

  angular.element( document ).ready( ()=> {
    angular.bootstrap( appRoot, [ ngModule.name ], {
      strictDi: true
    } )
  } );

}

function _getAppRoot( element: AppRoot ): Element {

  if ( typeof element === 'string' ) {
    return document.querySelector( element );
  }
  return element as Element;

}
