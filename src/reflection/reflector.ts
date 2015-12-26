import {Type,isPresent,isFunction} from "../facade/lang";

// This will be needed when we will used Reflect APIs
/*const Reflect = global.Reflect;
 if (!(Reflect && Reflect.getMetadata)) {
 throw 'reflect-metadata shim is required when using class decorators';
 }*/

/**
 * @internal
 * @private
 * @type {string}
 */
export const CLASS_META_KEY = '__mAnnotations';
/**
 * @internal
 * @private
 * @type {string}
 */
export const PARAM_META_KEY = '__mParameters';
/**
 * @internal
 * @private
 * @type {string}
 */
export const PROP_META_KEY = '__mPropMetadata';


/**
 * Provides access to reflection data about symbols. Used internally by Angular
 * to power dependency injection and compilation.
 */
export class Reflector {

  parameters( typeOrFunc: Type ): any[][] {
    //return Reflect.getMetadata('parameters', cls);
    return extractParameter( typeOrFunc );
  }

  registerParameters( parameters, type: Type ): void {
    //Reflect.defineMetadata('parameters', parameters, cls);
    type[ PARAM_META_KEY ] = parameters;
  }

  annotations( typeOrFunc: Type ): any[] {
    //return Reflect.getOwnMetadata('annotations', cls);
    return extractAnnotation( typeOrFunc );
  }

  registerAnnotation( annotations, type: Type ): void {
    //Reflect.defineMetadata('annotations', annotations, cls);
    type[ CLASS_META_KEY ] = annotations;
  }

  propMetadata( typeOrFunc: Type ): {[key: string]: any[]} {
    //return Reflect.getOwnMetadata('propMetadata', target.constructor);
    return extractProperty( typeOrFunc );
  }

  registerPropMetadata( propMetadata, type: Type ): void {
    //Reflect.defineMetadata('propMetadata', meta, target.constructor);
    type.constructor[ PROP_META_KEY ] = propMetadata;
  }

}


function extract( metaKey: string ) {

  return function ( cls: any ): any {

    if ( isFunction( cls ) && cls.hasOwnProperty( metaKey ) ) {
      // it is a decorator, extract annotation
      return cls[ metaKey ];
    }

  }

}

function extractAnnotation( cls: any ): any[] {

  return extract( CLASS_META_KEY )( cls );

}

function extractParameter( cls: any ): any[][] {

  return extract( PARAM_META_KEY )( cls );

}
function extractProperty( cls: any ): {[name:string]:any[]} {

  return extract( PROP_META_KEY )( cls );

}
