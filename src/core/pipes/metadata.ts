import {isPresent, CONST, Type} from '../../facade/lang';
import {InjectableMetadata} from '../di/metadata';

/**
 * Declare reusable pipe function.
 *
 * A "pure" pipe is only re-evaluated when either the input or any of the arguments change.
 *
 * When not specified, pipes default to being pure.
 *
 * ### Example
 *
 * {@example core/ts/metadata/metadata.ts region='pipe'}
 */
@CONST()
export class PipeMetadata extends InjectableMetadata {
  name: string;
  /** @internal */
  _pure: boolean;

  constructor({name, pure}: {name: string, pure?: boolean}) {
    super();
    this.name = name;
    this._pure = pure;
  }

  get pure(): boolean { return isPresent(this._pure) ? this._pure : true; }
}
