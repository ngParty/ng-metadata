import { assertionsEnabled } from '../facade/lang';
import { bundle, bundleNgModule } from '../core/util/bundler';

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

export function createBootstrapFn(bootstrapFn: Function = angular.bootstrap.bind(angular)): Function {

  /**
   * bootstrap angular app
   * @param {Type}  rootComponent
   * @param {Array<any>}  providers
   */
  return function bootstrap(
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
      bootstrapFn( appRoot, [ ngModuleName ], {
        strictDi
      } )
    } );

  }

}

export function createBootstrapModuleFn(bootstrapFn: Function = angular.bootstrap.bind(angular)): Function {

  /**
   * bootstrap angular app
   * @param {Type}  NgModule
   * @param {Array<any>}  providers
   */
  return function bootstrapModule(
    NgModule: Type
  ) {

    const angular1Module = bundleNgModule( NgModule );
    const angular1ModuleName = angular1Module.name;
    const strictDi = true;
    const element = document;

    if ( assertionsEnabled() ) {
      console.info(
        'Angular is running in the development mode. Call enableProdMode() to enable the production mode.'
      );
    } else {
      angular.module( angular1ModuleName ).config( prodModeConfig );
    }

    const appRoot = _getAppRoot( element );

    angular.element( document ).ready( ()=> {
      bootstrapFn( appRoot, [ angular1ModuleName ], {
        strictDi
      } )
    } );

  }

}
