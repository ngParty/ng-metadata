import {stringify,makeSelector,firstLowerCase} from './util';
import {isDirective,DirectiveConfigStatic} from './directives';
import {isPipe,PipeConfigStatic} from './pipe';
import {isInjectable, InjectableServiceConfigStatic} from "./di";

export {makeDirective} from './directives';
export {makePipe} from './pipe';


export type Token = string | Function | PipeConfigStatic | DirectiveConfigStatic | InjectableServiceConfigStatic;
/**
 * angular container methods name registrator
 * returns name for current type, how it should be registered within angular
 * @param {Class|string} Type
 * @param {{useClass?:Function}} [useClass={}]
 * @returns {string}
 */
export function provide(
  Type: Token, {useClass}: {
    useClass?: InjectableServiceConfigStatic
  }={}
): string {

  if ( isPipe( Type ) ) {
    return Type.pipeName;
  }
  if ( isDirective( Type ) ) {
    return makeSelector( Type.selector );
  }

  return _provideService( Type, useClass );

  function _provideService( Type: Token, useClass?: InjectableServiceConfigStatic ) {

    // if useClass we are using aliasing
    if ( useClass ) {

      if ( typeof Type === 'string' ) {

        // register alias on service if doesn't exist
        if ( useClass._name === undefined ) {

          useClass._name = Type;

        }

        return Type;

      }

      throw Error( 'if using useClass for aliasing services you need to provide string token as first parameter' );

    }

    if ( isInjectable( Type ) ) {

      return Type[ '_name' ];

    }

    // we create _name from service class name and augment provided class
    const serviceName = firstLowerCase( stringify( Type ) );
    Type[ '_name' ] = serviceName;

    return serviceName;

  }

}
