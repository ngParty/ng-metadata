import { Type } from '../../facade/lang';
import { GetterFn, SetterFn, MethodFn } from './types';

export interface PlatformReflectionCapabilities {
  isReflectionEnabled(): boolean;
  factory( type: Type ): Function;
  interfaces( type: Type ): any[];

  parameters( type: any ): any[][],
  rawParameters(typeOrFunc: Type): any[][],
  registerParameters( parameters, type: Type ): void,

  annotations( type: any ): any[],
  ownAnnotations(typeOrFunc: Type): any[],
  registerAnnotations( annotations, typeOrFunc: Type ): void,

  propMetadata( typeOrFunc: any ): {[key: string]: any[]},
  ownPropMetadata( typeOrFunc: Type ): {[key: string]: any[]},
  registerPropMetadata( propMetadata, typeOrFunc: Type ): void,

  registerDowngradedNg2ComponentName( componentName: string, typeOrFunc: Type ): void,
  downgradedNg2ComponentName( typeOrFunc: Type ): string

  getter( name: string ): GetterFn;
  setter( name: string ): SetterFn;
  method( name: string ): MethodFn;
}
