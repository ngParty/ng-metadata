import { isPresent, global, stringify } from '../../facade/lang';
import { GetterFn, SetterFn, MethodFn } from './types';
import { PlatformReflectionCapabilities } from './platform_reflection_capabilities';
import { ListWrapper } from '../../facade/collections';
import { Type } from '../../facade/type';
// import {BaseException} from 'angular2/src/facade/exceptions';


// This will be needed when we will used Reflect APIs
const Reflect = global.Reflect;
if ( !isReflectMetadata(Reflect) ) {
  throw `
    Reflect.*metadata shim is required when using class decorators.
    You can use one of: 
    - "reflect-metadata" (https://www.npmjs.com/package/reflect-metadata) 
    - "core-js/es7/reflect" (https://github.com/zloirock/core-js)
  `;
}

/**
 * @internal
 */
export const CLASS_META_KEY = 'annotations';
/**
 * @internal
 */
export const PARAM_META_KEY = 'parameters';
/**
 * @internal
 */
export const PARAM_REFLECT_META_KEY = 'design:paramtypes';
/**
 * @internal
 */
export const PROP_META_KEY = 'propMetadata';

/**
 * @internal
 */
export const DOWNGRADED_COMPONENT_NAME_KEY = 'downgradeComponentName';

function isReflectMetadata( reflect: any ): boolean {
  return isPresent( reflect ) && isPresent( reflect.getMetadata );
}

export class ReflectionCapabilities implements PlatformReflectionCapabilities {
  private _reflect: any;

  constructor( reflect=global.Reflect ) {
    this._reflect = reflect;
  }

  isReflectionEnabled(): boolean { return true; }

  factory( t: Type ): Function {
    switch ( t.length ) {
      case 0:
        return () => new t();
      case 1:
        return ( a1: any ) => new t( a1 );
      case 2:
        return ( a1: any, a2: any ) => new t( a1, a2 );
      case 3:
        return ( a1: any, a2: any, a3: any ) => new t( a1, a2, a3 );
      case 4:
        return ( a1: any, a2: any, a3: any, a4: any ) => new t( a1, a2, a3, a4 );
      case 5:
        return ( a1: any, a2: any, a3: any, a4: any, a5: any ) => new t( a1, a2, a3, a4, a5 );
      case 6:
        return ( a1: any, a2: any, a3: any, a4: any, a5: any, a6: any ) =>
          new t( a1, a2, a3, a4, a5, a6 );
      case 7:
        return ( a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any ) =>
          new t( a1, a2, a3, a4, a5, a6, a7 );
      case 8:
        return ( a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any ) =>
          new t( a1, a2, a3, a4, a5, a6, a7, a8 );
      case 9:
        return ( a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any ) =>
          new t( a1, a2, a3, a4, a5, a6, a7, a8, a9 );
      case 10:
        return (
          a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any,
          a10: any
        ) => new t( a1, a2, a3, a4, a5, a6, a7, a8, a9, a10 );
      case 11:
        return (
          a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any,
          a10: any, a11: any
        ) => new t( a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11 );
      case 12:
        return (
          a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any,
          a10: any, a11: any, a12: any
        ) =>
          new t( a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12 );
      case 13:
        return (
          a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any,
          a10: any, a11: any, a12: any, a13: any
        ) =>
          new t( a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13 );
      case 14:
        return (
          a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any,
          a10: any, a11: any, a12: any, a13: any, a14: any
        ) =>
          new t( a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14 );
      case 15:
        return (
          a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any,
          a10: any, a11: any, a12: any, a13: any, a14: any, a15: any
        ) =>
          new t( a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15 );
      case 16:
        return (
          a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any,
          a10: any, a11: any, a12: any, a13: any, a14: any, a15: any, a16: any
        ) =>
          new t( a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16 );
      case 17:
        return (
          a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any,
          a10: any, a11: any, a12: any, a13: any, a14: any, a15: any, a16: any, a17: any
        ) =>
          new t( a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16,
            a17 );
      case 18:
        return (
          a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any,
          a10: any, a11: any, a12: any, a13: any, a14: any, a15: any, a16: any, a17: any,
          a18: any
        ) => new t( a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15,
          a16, a17, a18 );
      case 19:
        return (
          a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any,
          a10: any, a11: any, a12: any, a13: any, a14: any, a15: any, a16: any, a17: any,
          a18: any, a19: any
        ) => new t( a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13,
          a14, a15, a16, a17, a18, a19 );
      case 20:
        return (
          a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any,
          a10: any, a11: any, a12: any, a13: any, a14: any, a15: any, a16: any, a17: any,
          a18: any, a19: any, a20: any
        ) => new t( a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11,
          a12, a13, a14, a15, a16, a17, a18, a19, a20 );
    }

    throw new Error(
      `Cannot create a factory for '${stringify( t )}' because its constructor has more than 20 arguments`
    );
  }

  /** @internal */
  _zipTypesAndAnnotations( paramTypes: any[], paramAnnotations: any[] ): any[][] {
    var result;

    if ( typeof paramTypes === 'undefined' ) {
      result = new Array( paramAnnotations.length );
    } else {
      result = new Array( paramTypes.length );
    }

    for ( var i = 0; i < result.length; i++ ) {
      // TS outputs Object for parameters without types, while Traceur omits
      // the annotations. For now we preserve the Traceur behavior to aid
      // migration, but this can be revisited.
      if ( typeof paramTypes === 'undefined' ) {
        result[ i ] = [];
      } else if ( paramTypes[ i ] != Object ) {
        result[ i ] = [ paramTypes[ i ] ];
      } else {
        result[ i ] = [];
      }
      if ( isPresent( paramAnnotations ) && isPresent( paramAnnotations[ i ] ) ) {
        result[ i ] = result[ i ].concat( paramAnnotations[ i ] );
      }
    }
    return result;
  }

  parameters( typeOrFunc: Type ): any[][] {
    // // Prefer the direct API.
    // if (isPresent((<any>typeOrFunc).parameters)) {
    //   return (<any>typeOrFunc).parameters;
    // }
    if ( isReflectMetadata( this._reflect ) ) {

      // get parameter created with @Inject()
      const paramAnnotations = this._reflect.getMetadata( PARAM_META_KEY, typeOrFunc );

      // get parameter created via TS type annotations
      const paramTypes = this._reflect.getMetadata( PARAM_REFLECT_META_KEY, typeOrFunc );

      if ( isPresent( paramTypes ) || isPresent( paramAnnotations ) ) {
        return this._zipTypesAndAnnotations( paramTypes, paramAnnotations );
      }

    }

    // The array has to be filled with `undefined` because holes would be skipped by `some`
    const parameters = new Array( (<any>typeOrFunc.length) );
    ListWrapper.fill( parameters, undefined );
    // parameters.fill(undefined);

    return parameters;
  }

  rawParameters( typeOrFunc: Type ): any[][] {
    return this._reflect.getMetadata( PARAM_META_KEY, typeOrFunc );
  }

  registerParameters( parameters, type: Type ): void {
    this._reflect.defineMetadata( PARAM_META_KEY, parameters, type );
  }

  annotations( typeOrFunc: Type ): any[] {
    // // Prefer the direct API.
    // if (isPresent((<any>typeOrFunc).annotations)) {
    //   var annotations = (<any>typeOrFunc).annotations;
    //   if (isFunction(annotations) && annotations.annotations) {
    //     annotations = annotations.annotations;
    //   }
    //   return annotations;
    // }
    if ( isReflectMetadata( this._reflect ) ) {
      const annotations = this._reflect.getMetadata( CLASS_META_KEY, typeOrFunc );
      if ( isPresent( annotations ) ) return annotations;
    }
    return [];
  }

  ownAnnotations( typeOrFunc: Type ): any[] {
    return this._reflect.getOwnMetadata( CLASS_META_KEY, typeOrFunc );
  }

  registerAnnotations( annotations, typeOrFunc: Type ): void {
    this._reflect.defineMetadata( CLASS_META_KEY, annotations, typeOrFunc );
  }

  propMetadata( typeOrFunc: any ): {[key: string]: any[]} {
    // // Prefer the direct API.
    // if (isPresent((<any>typeOrFunc).propMetadata)) {
    //   var propMetadata = (<any>typeOrFunc).propMetadata;
    //   if (isFunction(propMetadata) && propMetadata.propMetadata) {
    //     propMetadata = propMetadata.propMetadata;
    //   }
    //   return propMetadata;
    // }
    if ( isReflectMetadata( this._reflect ) ) {
      const propMetadata = this._reflect.getMetadata( PROP_META_KEY, typeOrFunc );
      if ( isPresent( propMetadata ) ) return propMetadata;
    }
    return {};
  }

  ownPropMetadata( typeOrFunc: Type ): {[key: string]: any[]} {
    return this._reflect.getOwnMetadata( PROP_META_KEY, typeOrFunc );
  }

  registerPropMetadata( propMetadata, typeOrFunc: Type|Function ): void {
    this._reflect.defineMetadata( PROP_META_KEY, propMetadata, typeOrFunc );
  }

  registerDowngradedNg2ComponentName( componentName: string, typeOrFunc: Type|Function ): void {
    this._reflect.defineMetadata( DOWNGRADED_COMPONENT_NAME_KEY, componentName, typeOrFunc );
  }

  downgradedNg2ComponentName( typeOrFunc: Type|Function ): string {
    return this._reflect.getOwnMetadata( DOWNGRADED_COMPONENT_NAME_KEY, typeOrFunc );
  }

  interfaces( type: Type ): any[] {
    // throw new BaseException("JavaScript does not support interfaces");
    throw new Error( 'JavaScript does not support interfaces' );
  }

  getter( name: string ): GetterFn { return <GetterFn>new Function( 'o', 'return o.' + name + ';' ); }

  setter( name: string ): SetterFn {
    return <SetterFn>new Function( 'o', 'v', 'return o.' + name + ' = v;' );
  }

  method( name: string ): MethodFn {
    let functionBody = `if (!o.${name}) throw new Error('"${name}" is undefined');
        return o.${name}.apply(o, args);`;
    return <MethodFn>new Function( 'o', 'args', functionBody );
  }

}
