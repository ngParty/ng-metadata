import {
  Type,
  isString,
  isBlank,
  isType,
  resolveDirectiveNameFromSelector,
  isPresent,
  stringify,
  getFuncName,
  normalizeBool,
  isArray
} from '../../facade/lang';
import { reflector } from '../reflection/reflection';
import { OpaqueToken } from './opaque_token';
import {
  OutputMetadata,
  HostBindingMetadata,
  HostListenerMetadata,
  InputMetadata
} from '../directives/metadata_directives';
import { InjectMetadata, SkipSelfMetadata, SelfMetadata, HostMetadata } from './metadata';
import { pipeProvider } from '../pipes/pipe_provider';
import { directiveProvider } from '../directives/directive_provider';
import { ListWrapper } from '../../facade/collections';
import { resolveForwardRef } from './forward_ref';
import { getErrorMsg } from '../../facade/exceptions';
import { isPipe, isOpaqueToken, isDirectiveLike, isService } from './provider_util';
import { isComponent } from './provider_util';
import { isInjectMetadata } from './provider_util';


export type PropMetaInst =  InputMetadata | OutputMetadata | HostBindingMetadata | HostListenerMetadata;
export type ParamMetaInst = HostMetadata | InjectMetadata | SelfMetadata | SkipSelfMetadata;
export type ProviderType = Type | string | OpaqueToken;
export type ProviderAliasOptions = {useClass?: Type,useValue?: any,useFactory?: Function, deps?: Object[]};

export class Provider {
  /**
   * Token used when retrieving this provider. Usually, it is a type {@link Type}.
   */
  token: any;

  /**
   * Binds a DI token to an implementation class.
   *
   * ### Example ([live demo](http://plnkr.co/edit/RSTG86qgmoxCyj9SWPwY?p=preview))
   *
   * Because `useExisting` and `useClass` are often confused, the example contains
   * both use cases for easy comparison.
   *
   * ```typescript
   * class Vehicle {}
   *
   * class Car extends Vehicle {}
   *
   * var injectorClass = Injector.resolveAndCreate([
   *   Car,
   *   {provide: Vehicle,  useClass: Car }
   * ]);
   * var injectorAlias = Injector.resolveAndCreate([
   *   Car,
   *   {provide: Vehicle,  useExisting: Car }
   * ]);
   *
   * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
   * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
   *
   * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
   * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
   * ```
   */
  useClass: Type;

  /**
   * Binds a DI token to a value.
   *
   * ### Example ([live demo](http://plnkr.co/edit/UFVsMVQIDe7l4waWziES?p=preview))
   *
   * ```javascript
   * var injector = Injector.resolveAndCreate([
   *   new Provider("message", { useValue: 'Hello' })
   * ]);
   *
   * expect(injector.get("message")).toEqual('Hello');
   * ```
   */
  useValue: any;

  /**
   * Binds a DI token to an existing token.
   *
   * {@link Injector} returns the same instance as if the provided token was used.
   * This is in contrast to `useClass` where a separate instance of `useClass` is returned.
   *
   * ### Example ([live demo](http://plnkr.co/edit/QsatsOJJ6P8T2fMe9gr8?p=preview))
   *
   * Because `useExisting` and `useClass` are often confused the example contains
   * both use cases for easy comparison.
   *
   * ```typescript
   * class Vehicle {}
   *
   * class Car extends Vehicle {}
   *
   * var injectorAlias = Injector.resolveAndCreate([
   *   Car,
   *   {provide: Vehicle,  useExisting: Car }
   * ]);
   * var injectorClass = Injector.resolveAndCreate([
   *   Car,
   *   {provide: Vehicle,  useClass: Car }
   * ]);
   *
   * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
   * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
   *
   * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
   * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
   * ```
   */
  useExisting: any;

  /**
   * Binds a DI token to a function which computes the value.
   *
   * ### Example ([live demo](http://plnkr.co/edit/Scoxy0pJNqKGAPZY1VVC?p=preview))
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   {provide: Number,  useFactory: () => { return 1+2; }},
   *   new Provider(String, { useFactory: (value) => { return "Value: " + value; },
   *                       deps: [Number] })
   * ]);
   *
   * expect(injector.get(Number)).toEqual(3);
   * expect(injector.get(String)).toEqual('Value: 3');
   * ```
   *
   * Used in conjunction with dependencies.
   */
  useFactory: Function;

  /**
   * Specifies a set of dependencies
   * (as `token`s) which should be injected into the factory function.
   *
   * ### Example ([live demo](http://plnkr.co/edit/Scoxy0pJNqKGAPZY1VVC?p=preview))
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   {provide: Number,  useFactory: () => { return 1+2; }},
   *   new Provider(String, { useFactory: (value) => { return "Value: " + value; },
   *                       deps: [Number] })
   * ]);
   *
   * expect(injector.get(Number)).toEqual(3);
   * expect(injector.get(String)).toEqual('Value: 3');
   * ```
   *
   * Used in conjunction with `useFactory`.
   */
  dependencies: Object[];

  /** @internal */
  _multi: boolean;

  constructor(
    token: any , {useClass, useValue, useExisting, useFactory, deps, multi}: {
      useClass?: Type,
      useValue?: any,
      useExisting?: any,
      useFactory?: Function,
      deps?: Object[],
      multi?: boolean
    }) {
    this.token = token;
    this.useClass = useClass;
    this.useValue = useValue;
    this.useExisting = useExisting;
    this.useFactory = useFactory;
    this.dependencies = deps;
    this._multi = multi;
  }

  /**
   * Creates multiple providers matching the same token (a multi-provider).
   *
   * Multi-providers are used for creating pluggable service, where the system comes
   * with some default providers, and the user can register additional providers.
   * The combination of the default providers and the additional providers will be
   * used to drive the behavior of the system.
   *
   * ### Example
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   new Provider("Strings", { useValue: "String1", multi: true}),
   *   new Provider("Strings", { useValue: "String2", multi: true})
   * ]);
   *
   * expect(injector.get("Strings")).toEqual(["String1", "String2"]);
   * ```
   *
   * Multi-providers and regular providers cannot be mixed. The following
   * will throw an exception:
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   new Provider("Strings", { useValue: "String1", multi: true }),
   *   new Provider("Strings", { useValue: "String2"})
   * ]);
   * ```
   */
  get multi(): boolean { return normalizeBool(this._multi); }
}

class ProviderBuilder{

  static createFromType(
    type: ProviderType,
    { useClass, useValue, useFactory, deps }: ProviderAliasOptions
  ): [string,Type] {

    // ...provide('myFactory',{useFactory: () => () => { return new Foo(); } })
    if ( isPresent( useFactory ) ) {
      const factoryToken = getInjectableName(type);
      const injectableDeps = isArray( deps ) ? deps.map(getInjectableName) : [];
      useFactory.$inject = injectableDeps;
      return [
        factoryToken,
        useFactory
      ];
    }

    // ...provide(opaqueTokenInst,{useValue: {foo:12312} })
    // ...provide('myValue',{useValue: {foo:12312} })
    if ( isPresent( useValue ) ) {
      const valueToken = getInjectableName(type);
      return [
        valueToken,
        useValue
      ];
    }

    const injectableType = isString( type ) || isOpaqueToken( type )
      ? resolveForwardRef(useClass as Type)
      : resolveForwardRef(type as Type);

    const overrideName = isString( type ) || isOpaqueToken( type )
      ? getInjectableName(type)
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

    // No Annotation === it's config function !!!
    // NOTE: we are not checking anymore if user annotated the class or not,
    // we cannot do that anymore at the costs for nic config functions registration
    if ( ListWrapper.isEmpty( annotations ) ) {
      return [ injectableType ] as any;
    }

    if ( ListWrapper.size( annotations ) > 1 ) {

      const hasComponentAnnotation = annotations.some( meta=>isComponent( meta ) );
      const hasNotAllowedSecondAnnotation = annotations.some( meta=> {
        return isDirectiveLike( meta ) || isService( meta ) || isPipe( meta );
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

    if ( isPipe( rootAnnotation ) ) {
      return pipeProvider.createFromType( injectableType );
    }

    if ( isDirectiveLike( rootAnnotation ) ) {
      return directiveProvider.createFromType( injectableType );
    }

    if ( isService( rootAnnotation ) ) {
      return [
        overrideName || rootAnnotation.id,
        injectableType
      ];
    }

  }

}

/**
 * should extract the string token from provided Type and add $inject angular 1 annotation to constructor if @Inject
 * was used
 * @returns {[string,Type]}
 * @deprecated
 */
export function provide(
  type: ProviderType,
  { useClass, useValue, useFactory, deps }: ProviderAliasOptions = {}
  ): [string,Type] {
  return ProviderBuilder.createFromType( type, { useClass, useValue, useFactory, deps } );
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

  if ( params.some( ( param ) => isBlank( param ) || ListWrapper.isEmpty( param ) ) ) {

    throw new Error(
      getErrorMsg(
        typeOrFunc,
        `you cannot have holes in constructor DI injection`
      )
    );

  }

  return params
    .map( ( p: any[] ) => _extractToken( p ) );

}

/**
 * should extract service/values/directives/pipes token from constructor @Inject() paramMetadata
 * @param metadata
 * @private
 * @internal
 */
export function _extractToken( metadata: ParamMetaInst[] ): string {

  // this is token obtained via design:paramtypes via Reflect.metadata
  const [paramMetadata] = metadata.filter( isType );
  // this is token obtained from @Inject() usage  for DI
  const [injectMetadata] = metadata.filter( isInjectMetadata ) as InjectMetadata[];

  if(isBlank(injectMetadata) && isBlank(paramMetadata)){
    return;
  }

  const { token=undefined } = injectMetadata || {};
  const injectable = resolveForwardRef( token ) || paramMetadata;

  return getInjectableName( injectable );

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
export function getInjectableName( injectable: ProviderType ): string {

  // @Inject('foo') foo
  if ( isString( injectable ) ) {
    return injectable;
  }

  // const fooToken = new OpaqueToken('foo')
  // @Inject(fooToken) foo
  if ( isOpaqueToken(injectable) ) {
    return injectable.desc;
  }

  // @Injectable()
  // class SomeService(){}
  //
  // @Inject(SomeService) someSvc
  // someSvc: SomeService
  if ( isType( injectable ) ) {

    // only the first class annotations is injectable
    const [annotation] = reflector.annotations( injectable );

    if ( isBlank( annotation ) ) {
      throw new Error( `
        cannot get injectable name token from none decorated class ${ getFuncName( injectable ) }
        Only decorated classes by one of [ @Injectable,@Directive,@Component,@Pipe ], can be injected by reference
      ` );
    }

    if ( isPipe(annotation) ) {
      return annotation.name;
    }

    if ( isDirectiveLike( annotation ) ) {
      return resolveDirectiveNameFromSelector( annotation.selector );
    }

    if ( isService( annotation ) ) {
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
 * @deprecated
 *
 * @TODO: delete this
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
