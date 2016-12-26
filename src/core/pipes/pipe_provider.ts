import {isFunction} from "../../facade/lang";
import {PipeResolver} from '../linker/pipe_resolver';
import {PipeMetadata} from "./metadata";
import {PipeTransform} from "./pipe_interfaces";
import { Type } from '../../facade/type';

/**
 * @internal
 */
export class PipeProvider {

  constructor( private pipeResolver: PipeResolver ) {}

  createFromType( type: Type ): [string,Function] {

    const metadata: PipeMetadata = this.pipeResolver.resolve( type );

    if ( !isFunction( (type.prototype as any).transform ) ) {
      throw new Error( `@Pipe: must implement '#transform' method` );
    }

    filterFactory.$inject = [ '$injector' ];
    function filterFactory( $injector: ng.auto.IInjectorService ) {

      const pipeInstance = $injector.instantiate<PipeTransform>( type );

      // return angular 1 filter function
      const filterFn = pipeInstance.transform.bind( pipeInstance );
      if ( metadata.pure === false ) {

        filterFn.$stateful = true;

      }

      return filterFn;

    }

    return [
      metadata.name,
      filterFactory
    ];

  }

}

/** @internal */
export const pipeProvider = new PipeProvider( new PipeResolver() );
