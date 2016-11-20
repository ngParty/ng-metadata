import { global, assertionsEnabled } from '../facade/lang';
import { bundle } from '../core/util/bundler';
import { Type } from '../facade/type';

type AppRoot = string | Element | Document;

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

export function createBootstrapFn(bootstrapFn: Function = global.angular.bootstrap.bind(global.angular)): Function {

  /**
   * bootstrap angular app
   * @param {Type}  NgModule
   * @param {Array<any>}  providers
   */
  return function bootstrapModule(
    NgModule: Type
  ) {

    const angular1Module = bundle( NgModule );
    const angular1ModuleName = angular1Module.name;
    const strictDi = true;
    const element = document;

    if ( assertionsEnabled() ) {
      console.info(
        'Angular is running in the development mode. Call enableProdMode() to enable the production mode.'
      );
    } else {
      global.angular.module( angular1ModuleName ).config( prodModeConfig );
    }

    const appRoot = _getAppRoot( element );

    global.angular.element( document ).ready( ()=> {
      bootstrapFn( appRoot, [ angular1ModuleName ], {
        strictDi
      } )
    } );

  }

}
