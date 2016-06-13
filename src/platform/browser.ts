import { assertionsEnabled } from '../facade/lang';
import { bundle } from '../core/util/bundler';

export * from './title';
export type AppRoot = string | Element | Document;

/**
 * bootstrap angular app
 * @param {Type}  rootComponent
 * @param {Array<any>}  providers
 */
export function bootstrap(
  rootComponent: Type,
  providers: any[]
) {

  const ngModule = bundle( rootComponent, providers );
  const ngModuleName = ngModule.name;
  const strictDi = true;
  const element = document;

  if ( assertionsEnabled() ) {
    console.info(
      'Angular is running in the development mode. Call enableProdMode() to enable the production mode.'
    );
  } else {
    angular.module( ngModuleName ).config( prodModeConfig );
  }

  const appRoot = _getAppRoot( element );

  angular.element( document ).ready( ()=> {
    angular.bootstrap( appRoot, [ ngModuleName ], {
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

prodModeConfig.$inject = [ '$compileProvider', '$httpProvider' ];
function prodModeConfig( $compileProvider: ng.ICompileProvider, $httpProvider: ng.IHttpProvider ) {
  $compileProvider.debugInfoEnabled( false );
  $httpProvider.useApplyAsync( true );
}
