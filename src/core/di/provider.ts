import {
  Type,
  isString,
  isBlank,
  isType,
  resolveDirectiveNameFromSelector,
  isPresent,
  stringify,
  getFuncName
} from '../../facade/lang';
import { reflector } from '../reflection/reflection';
import { OpaqueToken } from './opaque_token';
import { PipeMetadata } from '../pipes/metadata';
import {
  DirectiveMetadata,
  OutputMetadata,
  HostBindingMetadata,
  HostListenerMetadata,
  InputMetadata,
  ComponentMetadata
} from '../directives/metadata_directives';
import { InjectMetadata, InjectableMetadata, SkipSelfMetadata, SelfMetadata, HostMetadata } from './metadata';
import { pipeProvider } from '../pipes/pipe_provider';
import { directiveProvider } from '../directives/directive_provider';
import { ListWrapper } from '../../facade/collections';
import { resolveForwardRef } from './forward_ref';


export type PropMetaInst =  InputMetadata | OutputMetadata | HostBindingMetadata | HostListenerMetadata;
export type ParamMetaInst = HostMetadata | InjectMetadata | SelfMetadata | SkipSelfMetadata;
export type ProviderType = Type | string | OpaqueToken;

class ProviderBuilder{

  static createFromType(type: ProviderType, {useClass,useValue}:{useClass?:Type,useValue?:any} = {}): [string,Type]{

    // ...provide(opaqueTokenInst,{useValue: {foo:12312} })
    if ( type instanceof OpaqueToken ) {

      if(isBlank(useValue)){
        throw new Error(`
        Provider registration: "${ type.desc }":
        =======================================================
        you must provide useValue when registering constant/value via OpaqueToken
        `);
      }
      return [
        type.desc,
        useValue
      ];

    }

    // ...provide('myValue',{useValue: {foo:12312} })
    if ( isString( type ) && isPresent( useValue ) ) {
      return [
        type,
        useValue
      ];
    }

    const injectableType = isString( type )
      ? resolveForwardRef(useClass as Type)
      : resolveForwardRef(type as Type);

    const overrideName = isString( type )
      ? type
      : '';

    if ( !isType( injectableType ) ) {

      throw new Error( `
      Provider registration: "${stringify( injectableType )}":
      =======================================================
      token ${ stringify( injectableType ) } must be type of Type, You cannot provide none class
      ` );

    }

    /**
     *
     * @type {any[]}
     */
    const annotations = reflector.annotations( injectableType );

    const [rootAnnotation] = annotations;

    if ( ListWrapper.isEmpty( annotations ) ) {

      throw new Error( `
      Provider registration: "${ stringify(injectableType) }":
      =======================================================
      cannot create appropriate construct from provided Type.
       -> Type "${ stringify(injectableType) }" must have one of class decorators: [ @Pipe(), @Component(), @Directive(), @Injectable() ]
      ` );

    }

    if ( ListWrapper.size( annotations ) > 1 ) {

      const hasComponentAnnotation = annotations.some( meta=>isComponent( meta ) );
      const hasNotAllowedSecondAnnotation = annotations.some( meta=> {
        return isDirective( meta ) || isService( meta ) || isPipe( meta );
      } );

      if ( !hasComponentAnnotation || (hasNotAllowedSecondAnnotation && hasComponentAnnotation) ) {
        throw Error( `
        Provider registration: "${ stringify( injectableType ) }":
        =======================================================
        - you cannot use more than 1 class decorator,
        - you've used ${ annotations.map(meta=>stringify(meta.constructor)) }
        Multiple class decorators are allowed only for component class: [ @Component, @StateConfig? ]
        ` )
      }

    }

    injectableType.$inject = _dependenciesFor( injectableType );

    if (rootAnnotation instanceof PipeMetadata ) {
      return pipeProvider.createFromType( injectableType );
    }

    if (rootAnnotation instanceof DirectiveMetadata ) {
      return directiveProvider.createFromType( injectableType );
    }

    if (rootAnnotation instanceof InjectableMetadata ) {
      return [
        overrideName ||rootAnnotation.id,
        injectableType
      ];
    }

  }

}

/**
 * should extract the string token from provided Type and add $inject angular 1 annotation to constructor if @Inject
 * was used
 * @param type
 * @returns {string}
 */
export function provide( type: ProviderType, {useClass,useValue}:{useClass?:Type,useValue?:any} = {} ): [string,Type] {

  return ProviderBuilder.createFromType( type, { useClass, useValue } );

}

/**
 * creates $inject array Angular 1 DI annotation strings for provided Type
 * @param typeOrFunc
 * @returns {any}
 * @private
 * @internal
 */
export function _dependenciesFor(typeOrFunc: Type): string[] {

  const params = reflector.parameters(typeOrFunc);

  if ( isBlank( params ) ) return [];

  if ( params.some( isBlank ) ) {

    throw new Error( `
      ${ stringify( typeOrFunc ) } :
      -------------------------------------------------
      you cannot have holes in constructor DI injection
      ` );

  }

  if ( !_areAllDirectiveInjectionsAtTail( params ) ) {
    throw new Error( `
      ${ stringify( typeOrFunc ) } :
      -------------------------------------------------
      you cannot mix Directive @Inject() in constructor.
      @Host/@Self/@SkipSelf/@Optional+@Inject needs to be at last positions in constructor
    ` );
  }

  return params
    .filter( paramMeta=>paramMeta.length === 1 )
    .map( ( p: any[] ) => _extractToken( p ) );

}

/**
 * should extract service/values/directives/pipes token from constructor @Inject() paramMetadata
 * @param metadata
 * @private
 * @internal
 */
export function _extractToken( metadata: ParamMetaInst[] ): string {

  const [injectMetadata] = metadata
    .filter( paramMetadata=>paramMetadata instanceof InjectMetadata ) as InjectMetadata[];

  if(isBlank(injectMetadata)){
    return;
  }

  const {token} = injectMetadata;

  return getInjectableName( resolveForwardRef( token ) );

}

/**
 *  A utility function that can be used to get the angular 1 injectable's name. Needed for some cases, since
 *  injectable names are auto-created.
 *
 *  Works for string/OpaqueToken/Type
 *  Note: Type must be decorated otherwise it throws
 *
 *  @example
 *  ```typescript
 *  import { Injectable, getInjectableName } from 'ng-metadata/core';
 *  // this is given some random name like 'myService48' when it's created with `module.service`
 *
 *  @Injectable
 *  class MyService {}
 *
 *  console.log(getInjectableName(MyService)); // 'myService48'
 *  ```
 *
 * @param {ProviderType}  injectable
 * @returns {string}
 */
export function getInjectableName(injectable: ProviderType): string{

  // @Inject('foo') foo
  if ( isString( injectable ) ) {

    return injectable;

  }

  // const fooToken = new OpaqueToken('foo')
  // @Inject(fooToken) foo
  if ( injectable instanceof OpaqueToken ) {

    return injectable.desc;

  }

  // @Injectable()
  // class SomeService(){}
  //
  // @Inject(SomeService) someSvc
  if ( isType( injectable ) ) {

    // only the first class annotations is injectable
    const [annotation] = reflector.annotations( injectable );

    if ( isBlank( annotation ) ) {
      throw new Error( `
        cannot get injectable name token from none decorated class ${ getFuncName( injectable ) }
        Only decorated classes by one of [ @Injectable,@Directive,@Component,@Pipe ], can be injected by reference
      ` );
    }

    if ( annotation instanceof PipeMetadata ) {
      return annotation.name;
    }

    if ( annotation instanceof DirectiveMetadata ) {
      return resolveDirectiveNameFromSelector( annotation.selector );
    }

    if ( annotation instanceof InjectableMetadata ) {
      return annotation.id;
    }

  }

}

/**
 *
 * @param metadata
 * @returns {boolean}
 * @private
 * @internal
 */
export function _areAllDirectiveInjectionsAtTail( metadata: ParamMetaInst[][] ): boolean {

  return metadata.every( ( paramMetadata, idx, arr )=> {

    const isCurrentDirectiveInjection = paramMetadata.length > 1;

    const hasPrev = idx > 0;
    const hasNext = idx < arr.length - 1;

    if ( hasPrev ) {
      const prevInjection = arr[ idx - 1 ];
      const isPrevDirectiveInjection = prevInjection.length > 1;
      if ( isPrevDirectiveInjection && !isCurrentDirectiveInjection ) {
        return false;
      }
    }
    if ( hasNext ) {
      const nextInjection = arr[ idx + 1 ];
      const isNextDirectiveInjection = nextInjection.length > 1;
      if ( !isNextDirectiveInjection && isNextDirectiveInjection ) {
        return false;
      }
    }

    return true;

  } );

}


function isDirective( annotation: DirectiveMetadata ): boolean {
  return isString( annotation.selector ) && annotation instanceof DirectiveMetadata;
}
function isComponent( annotation: ComponentMetadata ): boolean {
  const hasTemplate = !isBlank( annotation.template || annotation.templateUrl );
  return isString( annotation.selector ) && hasTemplate && annotation instanceof ComponentMetadata
}
function isService(annotation: InjectableMetadata): boolean{
  return annotation instanceof InjectableMetadata;
}
function isPipe(annotation: PipeMetadata): boolean{
  return isString(annotation.name) && annotation instanceof PipeMetadata;
}
