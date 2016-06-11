import { global, isArray, isString, isType } from '../../facade/lang';
import { reflector } from '../reflection/reflection';
import { ComponentMetadata } from '../directives/metadata_directives';
import { getInjectableName, provide } from '../di/provider';
import { isProviderLiteral, createProvider, ProviderLiteral } from '../di/provider_util';
import { resolveReflectiveProvider } from '../di/reflective_provider';
import { getNgModuleMethodByType } from '../di/provider';

export function bundle( ComponentClass: Type, otherProviders: any[] = [], Module?: ng.IModule ): ng.IModule {

  const ngModuleName = getInjectableName( ComponentClass );
  const ngModule = Module || global.angular.module( ngModuleName, [] );
  const annotations = reflector.annotations( ComponentClass );
  const cmpAnnotation: ComponentMetadata = annotations[ 0 ];
  const { directives = [], pipes = [], providers = [], viewProviders = [] }={} = cmpAnnotation;

  // console.log( 'directives:', directives );
  // console.log( 'pipes:', pipes );
  // console.log( 'providers:', providers );
  // console.log( 'viewProviders:', viewProviders );


  // process component
  const cmpProvider = provide( ComponentClass );

  if ( isTypeRegistered( cmpProvider[ 0 ], ngModule, '$compileProvider', 'directive' ) ) {
    return ngModule;
  }

  ngModule.directive( cmpProvider[ 0 ], cmpProvider[ 1 ] );


  // 1. process component tree

  // step through all providers
  providers.forEach( ( ProviderType ) => {

    // @TODO
    // recursive
    if ( isArray( ProviderType ) ) {
      return;
    }

    if ( isString( ProviderType ) ) {
      ngModule.requires.push( ProviderType );
      return;
    }

    if ( isProviderLiteral( ProviderType ) ) {
      const provider = createProvider( ProviderType );
      const { method, name, value } = resolveReflectiveProvider( provider );
      if ( !isTypeRegistered( name, ngModule, '$provide', method ) ) {
        ngModule[ method ]( name, value );
      }
      return;
    }

    const serviceProvider = provide( ProviderType );
    if ( !isTypeRegistered( serviceProvider[ 0 ], ngModule, '$provide', 'service' ) ) {
      ngModule.service( ...provide( ProviderType ) );
    }

  } );
  // step through all viewProviders
  viewProviders.forEach( ( ViewProviderType ) => {

    // @TODO
    // recursive
    if ( isArray( ViewProviderType ) ) {
      return;
    }

    if ( isString( ViewProviderType ) ) {
      ngModule.requires.push( ViewProviderType );
      return;
    }

    if ( isProviderLiteral( ViewProviderType ) ) {
      const provider = createProvider( ViewProviderType );
      const { method, name, value } = resolveReflectiveProvider( provider );
      if ( !isTypeRegistered( name, ngModule, '$provide', method ) ) {
        ngModule[ method ]( name, value );
      }
      return;
    }

    const serviceProvider = provide( ViewProviderType );
    if ( !isTypeRegistered( serviceProvider[ 0 ], ngModule, '$provide', 'service' ) ) {
      ngModule.service( ...provide( ViewProviderType ) );
    }

  } );
  // step through all pipes
  pipes.forEach( ( PipeType: Type ) => {
    // @TODO
    // recursive
    if ( isArray( PipeType ) ) {
      return;
    }

    const pipeProvider = provide( PipeType );
    if ( !isTypeRegistered( pipeProvider[ 0 ], ngModule, '$filterProvider', 'register' ) ) {
      ngModule.filter( ...provide( PipeType ) );
    }
  } );
  // step through all directives
  directives.forEach( ( directiveType: Type ) => {
    return bundle( directiveType, [], ngModule );
  } );

  // 2. process otherProviders argument
  // - providers can be string(ngModule reference), Type, StringMap(providerLiteral)
  otherProviders.forEach( ( providerType: string|Type|ProviderLiteral|any[] ) => {
    if ( isString( providerType ) ) {
      ngModule.requires.push( providerType );
    }
    if ( isType( providerType ) ) {
      ngModule[ getNgModuleMethodByType(providerType) ]( ...provide(providerType) );
    }
    if ( isProviderLiteral( providerType ) ) {
      const provider = createProvider( providerType );
      const { method, name, value } = resolveReflectiveProvider( provider );
      ngModule[ method ]( name, value );
    }
    // @TODO
    // recursive
    if ( isArray( providerType ) ) {

    }
  } );

  return ngModule;

}

function isTypeRegistered(
  findRegisteredType: string,
  ngModule: ng.IModule,
  instanceType: string,
  methodName: string
): boolean {
  const invokeQueue: any[] = (ngModule as any)._invokeQueue;
  const types = invokeQueue
    .filter( ( [type,fnName]:[string,string] ) => {
      return type === instanceType && fnName === methodName;
    } )
    .map( ( [type,fnName, registeredProvider]:[string,string,[string,any]] ) => {
      return registeredProvider
    } );

  return types.some( ( [typeName,typeFn] )=> {
    return findRegisteredType === typeName;
  } )
}

function registerProvider( ngModule: ng.IModule, provider: any ): void {

}
