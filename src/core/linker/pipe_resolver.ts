import { isPresent, stringify } from '../../facade/lang';
import { ListWrapper } from '../../facade/collections';
import { PipeMetadata } from '../pipes/metadata';
import { reflector } from '../reflection/reflection';
import { resolveForwardRef } from '../di/forward_ref';
import { Type } from '../../facade/type';

function _isPipeMetadata( type: any ): boolean {
  return type instanceof PipeMetadata;
}

/**
 * Resolve a `Type` for {@link PipeMetadata}.
 *
 */
export class PipeResolver {
  /**
   * Return {@link PipeMetadata} for a given `Type`.
   */
  resolve( type: Type ): PipeMetadata {

    const metas = reflector.annotations( resolveForwardRef(type) );

    if ( isPresent( metas ) ) {
      const annotation = ListWrapper.find(metas, _isPipeMetadata );

      if ( isPresent( annotation ) ) {
        return annotation;
      }

    }
    throw new Error( `No Pipe decorator found on ${stringify( type )}` );
  }
}
