import {hasInjectables} from './util';



interface PipeFactory {
  ( obj: {name: string, pure?: boolean} ): ClassDecorator;
}
export interface PipeConfig {
  name: string,
  pure?: boolean
}
interface PipeConfigStatic {
  pipeName: string,
  pipePure: boolean
}
interface PipeInstance {
  transform( input: any, ...args ):any
}
/**
 *
 * @param {string}  name
 * @param {boolean?}  pure
 * @return {function(any): undefined}
 * @constructor
 */
export function Pipe( {name, pure=true}: PipeConfig ): ClassDecorator {

  if ( typeof name !== 'string' ) {
    throw Error( `@Pipe: must have 'name' property` );
  }

  return _pipeDecorator;

  function _pipeDecorator( Type: any ) {

    if ( hasInjectables( Type ) && pure ) {
      throw Error( '@Pipe: you provided Injectables but didnt specified pure:false' );
    }

    if ( typeof Type.prototype.transform !== 'function' ) {
      throw Error( `@Pipe: must implement '#transform' method` );
    }

    const staticConfig: PipeConfigStatic = {
      pipeName: name,
      pipePure: pure
    };

    // remove angular and use Object.assign instead
    angular.extend( Type, staticConfig );

  }

}

export function makePipe( Type: any ) {

  function filterFactory( $injector: ng.auto.IInjectorService ) {

    const pipeInstance = $injector.instantiate<PipeInstance>( Type );
    return Type.pipePure ? pipeInstance.transform : pipeInstance.transform.bind( pipeInstance );

  }
  filterFactory.$inject = [ '$injector' ];

  return filterFactory;

}

export function isPipe( Type ) {
  return typeof Type.pipeName === 'string' && typeof Type.pipePure === 'boolean';
}
