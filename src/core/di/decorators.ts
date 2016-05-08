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
export interface InjectMetadataFactory {
  (token: any): any;
  new (token: any): InjectMetadata;
}

/**
 * Factory for creating {@link OptionalMetadata}.
 */
export interface OptionalMetadataFactory {
  (): any;
  new (): OptionalMetadata;
}

/**
 * Factory for creating {@link InjectableMetadata}.
 */
export interface InjectableMetadataFactory {
  (_id?:string): any;
  new (_id?:string): InjectableMetadata;
}

/**
 * Factory for creating {@link SelfMetadata}.
 */
export interface SelfMetadataFactory {
  (): any;
  new (): SelfMetadata;
}

/**
 * Factory for creating {@link HostMetadata}.
 */
export interface HostMetadataFactory {
  (): any;
  new (): HostMetadata;
}

/**
 * Factory for creating {@link SkipSelfMetadata}.
 */
export interface SkipSelfMetadataFactory {
  (): any;
  new (): SkipSelfMetadata;
}

/**
 * Factory for creating {@link InjectMetadata}.
 */
export const Inject: InjectMetadataFactory = makeParamDecorator(InjectMetadata,InjectMetadata.paramDecoratorForNonConstructor);

/**
 * Factory for creating {@link OptionalMetadata}.
 */
export const Optional: OptionalMetadataFactory = makeParamDecorator(OptionalMetadata);

/**
 * Factory for creating {@link InjectableMetadata}.
 */
export const Injectable: InjectableMetadataFactory = makeDecorator(InjectableMetadata) as InjectableMetadataFactory;

/**
 * Factory for creating {@link SelfMetadata}.
 */
export const Self: SelfMetadataFactory = makeParamDecorator(SelfMetadata);

/**
 * Factory for creating {@link HostMetadata}.
 */
export const Host: HostMetadataFactory = makeParamDecorator(HostMetadata);

/**
 * Factory for creating {@link SkipSelfMetadata}.
 */
export const SkipSelf: SkipSelfMetadataFactory = makeParamDecorator(SkipSelfMetadata);
