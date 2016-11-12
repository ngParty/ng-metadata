import { getInjectableName } from '../core/di/provider';
import { StringWrapper } from '../facade/primitives';
import { Type } from '../facade/type';
import { global } from '../facade/lang';

// public helpers


export type IRender<T> = (
  Directive: Type,
  { jqHost, attrs, jqChildren }?: {
    jqHost?: ng.IAugmentedJQuery,
    attrs?: { [key: string]: any },
    jqChildren?: ng.IAugmentedJQuery
  }
) => { compiledElement: ng.IAugmentedJQuery, ctrl: T }

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
      jqHost = global.angular.element( hostElement );

    }
    // since attributes can be undefined we check them
    if (attrs){
      jqHost.attr(attrs);
    }
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
