export type AppRoot = string | Element | Document;

/**
 * bootstrap angular app
 * @param {string | ng.IModule}  ngModuleName
 * @param {string | Element | Document} [element=document]
 * @param {boolean} [strictDi=true]
 */
export function bootstrap(
  ngModuleName: string | ng.IModule,
  {element=document,strictDi=true}: {
    element?: AppRoot,
    strictDi?: boolean
  }={}
) {

  const appRoot = _getAppRoot( element );
  const appModName = (typeof ngModuleName === 'string') ? ngModuleName : ngModuleName.name;

  angular.element( document ).ready( ()=> {
    angular.bootstrap( appRoot, [ appModName ], {
      strictDi
    } )
  } );

}

function _getAppRoot( element: AppRoot ): Element {

  if ( typeof element === 'string' ) {
    return document.querySelector( element );
  }
  return element as Element;

}
