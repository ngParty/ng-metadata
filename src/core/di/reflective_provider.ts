import { isType, isArray, isString, getFuncName, isBlank, isPresent } from '../../facade/lang';

import { reflector } from '../reflection/reflection';

import { Provider, provide } from './provider';
import { isPipe, isDirectiveLike, isService, isProviderLiteral, createProvider, ProviderLiteral } from './provider_util';
import { isDirective } from './provider_util';

/**
 * process provider literals and return map for angular1Module consumption
 * @param provider
 * @returns {{method: string, name: string, value: any}}
 */
export function resolveReflectiveProvider( provider: Provider ): {method: string, name: string, value: any} {

  const {token} = provider;

  if (isPresent(provider.useValue)) {
    const [name,value] = provide( token, { useValue: provider.useValue } );
    const method = 'value';
    return { method, name, value };
  }
  if (provider.useFactory) {
    const [name,value] = provide( token, { useFactory: provider.useFactory, deps: provider.dependencies } );
    const method = 'factory';
    return { method, name, value };
  }
  if (provider.useClass) {
    const [name,value] = provide( token, { useClass: provider.useClass } );
    const method = 'service';
    return { method, name, value };
  }
  if (provider.useExisting) {
    const [name,value] = provide( provider.useExisting );
    const method = 'factory';

    throw new Error('useExisting is unimplemented');
    // target = (v) => v;
    // annotate(target, 'factory', {name});
    // annotate(target, 'inject', [toInjectorName(provider.useExisting)]);
  }

  throw new Error('invalid provider type! please specify one of: [useValue,useFactory,useClass]');

}

/**
 * returns StringMap of values needed for angular1Module registration and duplicity checks
 * @param injectable
 * @returns {any}
 * @private
 */
export function _getAngular1ModuleMetadataByType( injectable: Type ): { providerName: string, providerMethod: string, moduleMethod: string} {
  // only the first class annotations is injectable
  const [annotation] = reflector.annotations( injectable );

  if ( isBlank( annotation ) ) {

    // support configPhase ( function or pure class )
    if ( isType( injectable ) ) {
      return {
        providerName: '$injector',
        providerMethod: 'invoke',
        moduleMethod: 'config'
      }
    }

    throw new Error( `
        cannot get injectable name token from none decorated class ${ getFuncName( injectable ) }
        Only decorated classes by one of [ @Injectable,@Directive,@Component,@Pipe ], can be injected by reference
      ` );
  }

  if ( isPipe( annotation ) ) {
    return {
      providerName: '$filterProvider',
      providerMethod: 'register',
      moduleMethod: 'filter'
    }
  }

  if ( isDirectiveLike( annotation ) ) {
    return {
      providerName: '$compileProvider',
      providerMethod: 'directive',
      moduleMethod: 'directive'
    }
  }

  if ( isService( annotation ) ) {
    return {
      providerName: '$provide',
      providerMethod: 'service',
      moduleMethod: 'service'
    }
  }

}


/**
 * run through Component tree and register everything that is registered via Metadata
 * - works for nested arrays like angular 2 does ;)
 * @param angular1Module
 * @param providers
 * @returns {ng.IModule}
 * @private
 */
export function _normalizeProviders(
  angular1Module: ng.IModule,
  providers: Array<string|Type|ProviderLiteral|any[]>
): ng.IModule {

  providers.forEach( ( providerType ) => {

    // this is for legacy Angular 1 module
    if ( isString( providerType ) ) {
      angular1Module.requires.push( providerType );
      return;
    }

    // this works only for value,factory,aliased services
    // you cannot register directive/pipe within provider literal
    if ( isProviderLiteral( providerType ) ) {
      const provider = createProvider( providerType );
      const { method, name, value } = resolveReflectiveProvider( provider );
      if ( !_isTypeRegistered( name, angular1Module, '$provide', method ) ) {
        angular1Module[ method ]( name, value );
      }
      return;
    }

    // this is for pipes/directives/services
    if (isType(providerType)) {
      // const provider = createProvider( {provide:b, useClass:b} );
      // const { method, name, value } = resolveReflectiveProvider( provider );
      const [name,value] = provide( providerType );
      const { providerName, providerMethod, moduleMethod } = _getAngular1ModuleMetadataByType( providerType );

      // config phase support
      if ( isType( name ) ) {
        angular1Module.config( name );
        return;
      }

      if ( !_isTypeRegistered( name, angular1Module, providerName, providerMethod ) ) {
        // @TODO register via this once requires are resolved for 3 types of attr directive from template
        // _registerTypeProvider( angular1Module, providerType, { moduleMethod, name, value } );
        angular1Module[ moduleMethod ]( name, value );
      }
      return;
    }

    // un flattened array, unwrap and parse next array level of providers
    if (isArray(providerType)) {
      _normalizeProviders( angular1Module, providerType );
    } else {
      throw new Error(`InvalidProviderError(${providerType})`);
    }
  });

  // return res;
  return angular1Module;
}

/**
 * check if `findRegisteredType` is registered within angular1Module, so we don't have duplicates
 * @param findRegisteredType
 * @param angular1Module
 * @param instanceType
 * @param methodName
 * @returns {boolean}
 * @private
 */
export function _isTypeRegistered(
  findRegisteredType: string,
  angular1Module: ng.IModule,
  instanceType: string,
  methodName: string
): boolean {
  const invokeQueue: any[] = (angular1Module as any)._invokeQueue;
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


/**
 * we need to register 3 types of attribute directives, if we are registering directive,
 * because we need to allow all 3 types of binding on the defined directive [name],(name),name
 * @private
 */
export function _registerTypeProvider(
  angular1Module: ng.IModule,
  provider: Type,
  { moduleMethod, name, value }: { moduleMethod: string,name: string,value: Function }
): void {

  // only the first class annotations is injectable
  const [annotation] = reflector.annotations( provider );
  if ( isBlank( annotation ) ) { return }

  // we need to register attr directives for all possible binding types
  if ( isDirective( annotation ) ) {
    angular1Module[ moduleMethod ]( name, value );
    angular1Module[ moduleMethod ]( `[${name}]`, value );
    angular1Module[ moduleMethod ]( `(${name})`, value );
  } else {
    angular1Module[ moduleMethod ]( name, value )
  }

}
