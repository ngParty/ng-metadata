import { isString, isPresent } from '../../facade/lang';
import { DirectiveMetadata, ComponentMetadata, NgModuleMetadata } from '../directives/metadata_directives';
import { PipeMetadata } from '../pipes/metadata';

import { Provider } from './provider';
import { OpaqueToken } from './opaque_token';
import { InjectableMetadata, InjectMetadata } from './metadata';

export type ProviderLiteral = {
  provide: any,
  useClass?: Type,
  useValue?: any,
  useFactory?: Function,
  useExisting?: any,
  deps?: Object[],
  multi?: boolean
};

export function isProviderLiteral( obj: any ): obj is ProviderLiteral {
  return obj && typeof obj == 'object' && obj.provide;
}

export function createProvider( obj: ProviderLiteral ): Provider {
  return new Provider( obj.provide, obj );
}

export function isOpaqueToken( obj: any ): obj is OpaqueToken {
  return obj instanceof OpaqueToken;
}

export function isDirectiveLike( annotation: any ): annotation is DirectiveMetadata|ComponentMetadata {
  return isString( annotation.selector ) && annotation instanceof DirectiveMetadata;
}
export function isDirective( annotation: any ): annotation is DirectiveMetadata {
  return isDirectiveLike( annotation ) && !_hasTemplate( annotation );
}
export function isComponent( annotation: any ): annotation is ComponentMetadata {
  return isString( annotation.selector ) && _hasTemplate(annotation) && annotation instanceof ComponentMetadata
}
function _hasTemplate( annotation: any ): boolean {
  return isPresent( annotation.template || annotation.templateUrl );
}

export function isService(annotation: any): annotation is InjectableMetadata {
  return annotation instanceof InjectableMetadata;
}
export function isPipe(annotation: any): annotation is PipeMetadata {
  return isString(annotation.name) && annotation instanceof PipeMetadata;
}
export function isInjectMetadata( injectMeta: any ): injectMeta is InjectMetadata {
  return injectMeta instanceof InjectMetadata;
}

export function isNgModule( annotation: any ): annotation is NgModuleMetadata {
  return isPresent( annotation.declarations ) && annotation instanceof NgModuleMetadata
}
