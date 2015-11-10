import {stringify,makeSelector,firstLowerCase} from './util';
import {isDirective} from './directives';
import {isPipe} from './pipe';

export {makeDirective} from './directives';
export {makePipe} from './pipe';

/**
 * angular container methods name registrator
 * @param {Class} Type
 * @param {{useAlias?:string}} [useAlias={}]
 * @returns {string}
 */
export function provide( Type: any, {useAlias}: {
  useAlias?: string
}={} ): string {

  if ( isPipe( Type ) ) {
    return Type.pipeName;
  }
  if ( isDirective( Type ) ) {
    return makeSelector( Type.selector );
  }

  return _provideService( Type, useAlias );

  function _provideService( Type, alias?: string ) {

    if ( alias ) {

      return alias;

    }

    const serviceName = stringify( Type );
    return firstLowerCase(serviceName);

  }

}
