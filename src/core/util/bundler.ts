import { global } from '../../facade/lang';
import { reflector } from '../reflection/reflection';
import { ComponentMetadata, NgModuleMetadata } from '../directives/metadata_directives';
import { getInjectableName, provide } from '../di/provider';
import { isNgModule } from '../di/provider_util';

import {
  _isTypeRegistered, _normalizeProviders, _getNgModuleMetadataByType,
  _registerTypeProvider
} from '../di/reflective_provider';
import { ListWrapper } from '../../facade/collections';

export function bundle( ComponentClass: Type, otherProviders: any[] = [], NgModule?: ng.IModule ): ng.IModule {

  // Support registering downgraded ng2 components directly
  const downgradedNgComponentName = reflector.downgradedNg2ComponentName( ComponentClass );
  if (downgradedNgComponentName) {
    const ngModule = NgModule || global.angular.module( downgradedNgComponentName, [] );
    ngModule.directive( downgradedNgComponentName, ComponentClass );
    return ngModule;
  }

  const ngModuleName = getInjectableName( ComponentClass );
  const ngModule = NgModule || global.angular.module( ngModuleName, [] );
  const annotations = reflector.annotations( ComponentClass );
  const cmpAnnotation: ComponentMetadata = annotations[ 0 ];
  const { directives = [], pipes = [], providers = [], viewProviders = [] }={} = cmpAnnotation;

  // process component
  const [cmpName,cmpFactoryFn] = provide( ComponentClass );
  const { providerName, providerMethod, moduleMethod } = _getNgModuleMetadataByType( ComponentClass );

  if ( _isTypeRegistered( cmpName, ngModule, providerName, providerMethod ) ) {
    return ngModule;
  }

  // @TODO register via this once requires are resolved for 3 types of attr directive from template
  // _registerTypeProvider( ngModule, ComponentClass, { moduleMethod, name: cmpName, value: cmpFactoryFn } );
  ngModule[moduleMethod]( cmpName, cmpFactoryFn );

  // 1. process component/directive decorator providers/viewProviders/pipes
  _normalizeProviders( ngModule, providers );
  _normalizeProviders( ngModule, viewProviders );
  _normalizeProviders( ngModule, pipes );


  // step through all directives
  ListWrapper.flattenDeep(directives).forEach( ( directiveType: Type ) => {
    bundle( directiveType, [], ngModule );
  } );

  // 2. process otherProviders argument
  // - providers can be string(ngModule reference), Type, StringMap(providerLiteral)
  // - directives can't be registered as via global providers only @Injectable,@Pipe,{provide:any,use*:any}
  // registerProviders(ngModule, otherProviders);
  _normalizeProviders( ngModule, otherProviders );

  return ngModule;
}

export function bundleNgModule( NgModuleClass: Type, existingAngularModule?: ng.IModule ): ng.IModule {

  const angularModuleName = getInjectableName( NgModuleClass );
  const angularModule = existingAngularModule || global.angular.module( angularModuleName, [] );
  const annotations = reflector.annotations( NgModuleClass );
  const ngModuleAnnotation: NgModuleMetadata = annotations[ 0 ];
  const { declarations = [], providers = [], imports = [] }={} = ngModuleAnnotation;

  _normalizeProviders( angularModule, declarations );
  _normalizeProviders( angularModule, providers );

  /**
   * Process `imports`
   */

  // 1. imports which are not NgModules
  const nonNgModuleImports: any[] = imports.filter((imported) => {
    if (typeof imported !== 'function') {
      return true
    }
    const annotations = reflector.annotations( imported );
    return !isNgModule(ngModuleAnnotation)
  })

  _normalizeProviders( angularModule, nonNgModuleImports );

  // 2.imports which are NgModules
  const NgModuleImports: any[] = imports.filter((imported) => {
    if (typeof imported !== 'function') {
      return false
    }
    const annotations = reflector.annotations( imported );
    return isNgModule(ngModuleAnnotation)
  })

  NgModuleImports.forEach(( importedNgModule: Type ) => {
    bundleNgModule(importedNgModule, angularModule)
  })

  return angularModule;
}
