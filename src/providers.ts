import {stringify,makeSelector} from './util';
import {isDirective} from './directives';
import {isPipe} from './pipe';

export {makeDirective} from './directives';
export {makePipe} from './pipe';

/**
 * angular container methods name registrator
 * @param {Class} Type
 * @param {{as?:string}} [as={}]
 * @returns {string}
 */
export function provide(
  Type: any, {as}:{
    as?: string
  }={}
): string {

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
