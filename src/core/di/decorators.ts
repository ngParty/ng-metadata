import {
  InjectMetadata,
  OptionalMetadata,
  InjectableMetadata,
  SelfMetadata,
  HostMetadata,
  SkipSelfMetadata
} from './metadata';
import {makeDecorator, makeParamDecorator} from '../util/decorators';

/**
 * Factory for creating {@link InjectMetadata}.
 */
export interface InjectFactory {
  (token: any): any;
  new (token: any): InjectMetadata;
}

/**
 * Factory for creating {@link OptionalMetadata}.
 */
export interface OptionalFactory {
  (): any;
  new (): OptionalMetadata;
}

/**
 * Factory for creating {@link InjectableMetadata}.
 */
export interface InjectableFactory {
  (): any;
  new (): InjectableMetadata;
}

/**
 * Factory for creating {@link SelfMetadata}.
 */
export interface SelfFactory {
  (): any;
  new (): SelfMetadata;
}

/**
 * Factory for creating {@link HostMetadata}.
 */
export interface HostFactory {
  (): any;
  new (): HostMetadata;
}

/**
 * Factory for creating {@link SkipSelfMetadata}.
 */
export interface SkipSelfFactory {
  (): any;
  new (): SkipSelfMetadata;
}

/**
 * Factory for creating {@link InjectMetadata}.
 */
export const Inject: InjectFactory = makeParamDecorator(InjectMetadata,InjectMetadata.paramDecoratorForNonConstructor);

/**
 * Factory for creating {@link OptionalMetadata}.
 */
export const Optional: OptionalFactory = makeParamDecorator(OptionalMetadata);

/**
 * Factory for creating {@link InjectableMetadata}.
 */
export const Injectable: InjectableFactory = makeDecorator(InjectableMetadata) as InjectableFactory;

/**
 * Factory for creating {@link SelfMetadata}.
 */
export const Self: SelfFactory = makeParamDecorator(SelfMetadata);

/**
 * Factory for creating {@link HostMetadata}.
 */
export const Host: HostFactory = makeParamDecorator(HostMetadata);

/**
 * Factory for creating {@link SkipSelfMetadata}.
 */
export const SkipSelf: SkipSelfFactory = makeParamDecorator(SkipSelfMetadata);
