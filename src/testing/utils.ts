import { isFunction } from '../facade/lang';
import { getInjectableName } from '../core/di/provider';
import { StringWrapper } from '../facade/primitives';
import { isArray } from 'util';
import { assign } from '../facade/lang';

// public helpers


export interface IRender{
  <T extends Type>(Directive: T, {jqHost, attrs, jqChildren}?: {
    jqHost?: ng.IAugmentedJQuery,
    attrs?: { [key: string]: any },
    jqChildren?: ng.IAugmentedJQuery
  }
  ):{
    compiledElement: ng.IAugmentedJQuery,
    ctrl: T
  }
}
/**
 * factory which will return function which will be used as your render method
 */
export function renderFactory( $compile: ng.ICompileService, $scope: any ) {

  return _compileAndDigest;

  function _compileAndDigest<T extends Type>(
    Directive: T,
    {jqHost, attrs, jqChildren}:{
      jqHost?: ng.IAugmentedJQuery
      attrs?: {[key:string]:any},
      jqChildren?: ng.IAugmentedJQuery
    } = {}
  ): { compiledElement: ng.IAugmentedJQuery, ctrl: T}{

    const ctrlName = getInjectableName( Directive );
    const selector = StringWrapper.kebabCase( ctrlName );

    // is Directive
    if ( jqHost ) {

      jqHost.attr( selector, '' )

    } else {
      // is Component

      const hostElement = `<${selector}></${selector}>`;
      jqHost = angular.element( hostElement );

    }

    jqHost.attr(attrs);

    if (jqChildren) {
      jqHost.append(jqChildren);
    }

    // angular api
    const compiledElement = $compile(jqHost)($scope);
    const ctrl = compiledElement.controller(ctrlName) as T;
    $scope.$apply();

    return { compiledElement, ctrl };

  }

}

export function getInput(element: ng.IAugmentedJQuery) {
  return element.find('input');
}
