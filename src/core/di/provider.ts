import {
  Type,
  isFunction,
  isString,
  isBlank,
  isType,
  getTypeName,
  resolveDirectiveNameFromSelector,
  isPresent,
  stringify
} from '../../facade/lang';
import {reflector} from "../reflection/reflection";
import {OpaqueToken} from "./opaque_token";
import {PipeMetadata} from "../pipes/metadata";
import {
  DirectiveMetadata,
  OutputMetadata,
  HostBindingMetadata,
  HostListenerMetadata,
  InputMetadata
} from "../directives/metadata_directives";
import {
  InjectMetadata,
  InjectableMetadata,
  SkipSelfMetadata,
  SelfMetadata,
  HostMetadata
} from './metadata';
import {pipeProvider} from "../pipes/pipe_provider";
import {directiveProvider} from "../directives/directive_provider";


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
      ? useClass
      : type as Type;

    const overrideName = isString( type )
      ? type
      : '';

    if ( !isType( injectableType ) ) {

      throw new Error( `
      Provider registration: "${stringify( injectableType )}":
      =======================================================
      token ${ stringify( injectableType ) } must be type of Type, You cannot provide non class
      ` );

    }

    injectableType.$inject = _dependenciesFor( injectableType );

    const [annotation] = reflector.annotations( injectableType );
    const [paramMetadata] = reflector.parameters( injectableType );


    if ( isBlank( annotation ) ) {

      throw new Error( `
      Provider registration: "${ stringify(injectableType) }":
      =======================================================
      cannot create appropriate construct from provided Type.
       -> Type "${ stringify(injectableType) }" must be on of [ @Pipe(), @Component(), @Directive(), @Injectable() ]
      ` );

    }

    if ( annotation instanceof PipeMetadata ) {
      return pipeProvider.createFromType( injectableType );
    }

    if ( annotation instanceof DirectiveMetadata ) {
      return directiveProvider.createFromType( injectableType );
    }

    if ( annotation instanceof InjectableMetadata ) {
      return ProviderBuilder._provideService(injectableType,overrideName);
    }

  }

  private static _provideService( injectableType: Type, overriddenName?: string ): [string,Type] {
    return [
      overriddenName || getTypeName( injectableType ),
      injectableType
    ]
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

  return _getTokenStringFromInjectable(token);

}

/**
 *
 * @param injectable
 * @returns {any}
 * @private
 * @internal
 */
export function _getTokenStringFromInjectable(injectable: ProviderType): string{

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

    if ( annotation instanceof PipeMetadata ) {
      return annotation.name;
    }

    if ( annotation instanceof DirectiveMetadata ) {
      return resolveDirectiveNameFromSelector( annotation.selector );
    }

    if ( annotation instanceof InjectableMetadata || isBlank( annotation ) ) {
      return getTypeName( injectable );
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
