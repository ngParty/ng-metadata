import { global } from '../../facade/lang';
import { reflector } from '../reflection/reflection';
import { ComponentMetadata } from '../directives/metadata_directives';
import { getInjectableName, provide } from '../di/provider';
import {
  _isTypeRegistered, _normalizeProviders, _getNgModuleMetadataByType,
  _registerTypeProvider
} from '../di/reflective_provider';
import { ListWrapper } from '../../facade/collections';

export function bundle( ComponentClass: Type, otherProviders: any[] = [], NgModule?: ng.IModule ): ng.IModule {

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
