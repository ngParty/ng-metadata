//import angular from './facade';
import {hasInjectables, is} from './util';
import { assign } from "./facade/lang";

//const assign = assignFactory();

interface PipeFactory {
  ( obj: {name: string, pure?: boolean} ): ClassDecorator;
}

export interface PipeConfigStatic {
  pipeName: string,
  pipePure: boolean
}
interface PipeInstance {
  transform( input: any, ...args ):any
}
/**
 * Pipe Class Decorator
 * @param {string}  name
 * @param {boolean?}  pure
 * @return {function(any): undefined}
 * @constructor
 */
export function Pipe(
  {name, pure=true}: {
    name?: string,
    pure?: boolean
  }={}
): ClassDecorator {

  if ( typeof name !== 'string' ) {
    throw Error( `@Pipe: must have 'name' property` );
  }

  return _pipeDecorator;

  function _pipeDecorator( Type: any ) {

    if ( hasInjectables( Type ) && pure ) {
      throw Error( `@Pipe: you provided Injectables but didn't specified pure:false` );
    }

    if ( typeof Type.prototype.transform !== 'function' ) {
      throw Error( `@Pipe: must implement '#transform' method` );
    }

    const staticConfig: PipeConfigStatic = {
      pipeName: name,
      pipePure: pure
    };

    // remove angular and use Object.assign instead
    assign( Type, staticConfig );

  }

}

export function makePipe( Type: any ) {

  filterFactory.$inject = [ '$injector' ];
  function filterFactory( $injector: ng.auto.IInjectorService ) {

    const pipeInstance = $injector.instantiate<PipeInstance>( Type );
    return Type.pipePure
      ? pipeInstance.transform
      : pipeInstance.transform.bind( pipeInstance );

  }

  return filterFactory;

}


// custom type guards
export function isPipe( Type: any ): Type is PipeConfigStatic {
  return is( Type, 'pipeName' );
}
