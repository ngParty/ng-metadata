import { global, isFunction } from '../../facade/lang';
import { reflector } from '../reflection/reflection';
import { ComponentMetadata, NgModuleMetadata } from '../directives/metadata_directives';
import { getInjectableName, provide } from '../di/provider';
import { isNgModule } from '../di/provider_util';

import {
  _isTypeRegistered, _normalizeProviders, _getAngular1ModuleMetadataByType,
  _registerTypeProvider
} from '../di/reflective_provider';
import { ListWrapper } from '../../facade/collections';
import { Type } from '../../facade/type';

function _bundleComponent( ComponentClass: Type, otherProviders: any[] = [], existingAngular1Module?: ng.IModule ): ng.IModule {

  // Support registering downgraded ng2 components directly
  const downgradedNgComponentName = reflector.downgradedNg2ComponentName( ComponentClass );
  if (downgradedNgComponentName) {
    const angular1Module = existingAngular1Module || global.angular.module( downgradedNgComponentName, [] );
    angular1Module.directive( downgradedNgComponentName, ComponentClass );
    return angular1Module;
  }

  const angular1ModuleName = getInjectableName( ComponentClass );
  const angular1Module = existingAngular1Module || global.angular.module( angular1ModuleName, [] );
  const annotations = reflector.annotations( ComponentClass );
  const cmpAnnotation: ComponentMetadata = annotations[ 0 ];
  const { providers = [], viewProviders = [] }={} = cmpAnnotation;

  // process component
  const [cmpName,cmpFactoryFn] = provide( ComponentClass );
  const { providerName, providerMethod, moduleMethod } = _getAngular1ModuleMetadataByType( ComponentClass );

  if ( _isTypeRegistered( cmpName, angular1Module, providerName, providerMethod ) ) {
    return angular1Module;
  }

  // @TODO register via this once requires are resolved for 3 types of attr directive from template
  // _registerTypeProvider( angular1Module, ComponentClass, { moduleMethod, name: cmpName, value: cmpFactoryFn } );
  angular1Module[moduleMethod]( cmpName, cmpFactoryFn );

  // 1. process component/directive decorator providers/viewProviders
  _normalizeProviders( angular1Module, providers );
  _normalizeProviders( angular1Module, viewProviders );

  // 2. process otherProviders argument
  // - providers can be string(angular1Module reference), Type, StringMap(providerLiteral)
  // - directives can't be registered as via global providers only @Injectable,@Pipe,{provide:any,use*:any}
  // registerProviders(angular1Module, otherProviders);
  _normalizeProviders( angular1Module, otherProviders );

  return angular1Module;
}

export function bundle( NgModuleClass: Type, otherProviders: any[] = [], existingAngular1Module?: ng.IModule ): ng.IModule {

  const angular1ModuleName = getInjectableName( NgModuleClass );
  const angular1Module = existingAngular1Module || global.angular.module( angular1ModuleName, [] );
  const annotations = reflector.annotations( NgModuleClass );
  const ngModuleAnnotation: NgModuleMetadata = annotations[ 0 ];
  if (!isNgModule(ngModuleAnnotation)) {
    throw new Error(`bundle() requires a decorated NgModule as its first argument`)
  }
  const { declarations = [], providers = [], imports = [] }={} = ngModuleAnnotation;

  /**
   * Process `declarations`
   */
  ListWrapper.flattenDeep(declarations).forEach( ( directiveType: Type ) => {
    _bundleComponent( directiveType, [], angular1Module );
  } );

  /**
   * Process `providers`
   */
  _normalizeProviders( angular1Module, providers );

  /**
   * Process `imports`
   */

  // 1. imports which are not NgModules
  const nonNgModuleImports: any[] = imports.filter((imported) => {
    if (!isFunction(imported)) {
      return true
    }
    const annotations = reflector.annotations( imported );
    return !isNgModule(ngModuleAnnotation)
  })

  _normalizeProviders( angular1Module, nonNgModuleImports );

  // 2.imports which are NgModules
  const NgModuleImports: any[] = imports.filter((imported) => {
    if (!isFunction(imported)) {
      return false
    }
    const annotations = reflector.annotations( imported );
    return isNgModule(ngModuleAnnotation)
  })

  NgModuleImports.forEach(( importedNgModule: Type ) => {
    bundle(importedNgModule, [], angular1Module)
  })

  /**
   * Process `otherProviders`
   */
  _normalizeProviders( angular1Module, otherProviders );

  return angular1Module;
}
