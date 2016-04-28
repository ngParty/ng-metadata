import { makeDecorator } from '../util/decorators';
import { PipeMetadata } from './metadata';

/**
 * {@link PipeMetadata} factory for creating decorators.
 *
 * ### Example
 *
 * {@example core/ts/metadata/metadata.ts region='pipe'}
 */
export interface PipeMetadataFactory {
  (obj: {name: string, pure?: boolean}): any;
  new (obj: {name: string, pure?: boolean}): any;
}

export const Pipe: PipeMetadataFactory = makeDecorator(PipeMetadata) as PipeMetadataFactory;
