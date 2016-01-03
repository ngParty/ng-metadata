import {
  makeDecorator,
  TypeDecorator
} from '../util/decorators';
import {Type} from '../facade/lang';
import {PipeMetadata} from './metadata';

/**
 * {@link PipeMetadata} factory for creating decorators.
 *
 * ### Example
 *
 * {@example core/ts/metadata/metadata.ts region='pipe'}
 */
export interface PipeFactory {
  (obj: {name: string, pure?: boolean}): any;
  new (obj: {name: string, pure?: boolean}): any;
}

export const Pipe: PipeFactory = makeDecorator(PipeMetadata) as PipeFactory;
