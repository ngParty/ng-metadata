import {global, Type, isFunction, isString, isPresent} from '../facade/lang';
import {reflector} from '../reflection/reflection';

/**
 * An interface implemented by all Angular type decorators,
 * which allows them to be used as ES7 decorators
 *
 * ES7 syntax:
 *
 * ```
 * @Component({...})
 * class MyClass {...}
 * ```
 */
export interface TypeDecorator {
  /**
   * Invoke as ES7 decorator.
   */
  <T extends Type>( type: T ): T;

  // Make TypeDecorator assignable to built-in ParameterDecorator type.
  // ParameterDecorator is declared in lib.d.ts as a `declare type`
  // so we cannot declare this interface as a subtype.
  // see https://github.com/angular/angular/issues/3379#issuecomment-126169417
  ( target: Object, propertyKey?: string | symbol, parameterIndex?: number ): void;

}


export function makeDecorator(
  AnnotationCls: any,
  chainFn: ( fn: Function ) => void = null
): ( ...args: any[] ) => ( cls: any ) => any {

  function DecoratorFactory( objOrType ): ( cls: any ) => any {

    var annotationInstance = new AnnotationCls( objOrType );

    if ( this instanceof AnnotationCls ) {

      return annotationInstance;

    } else {

      //var chainAnnotation = isFunction( this ) && this.annotations instanceof Array
      //  ? this.annotations
      //  : [];
      //chainAnnotation.push(annotationInstance);

      function TypeDecorator( cls ): TypeDecorator {

        let annotations = reflector.annotations(cls);

        annotations = annotations || [];
        annotations.push( annotationInstance );
        reflector.registerAnnotation(annotations,cls);

        return cls;

      }

      if ( chainFn ) {
        chainFn( TypeDecorator );
      }

      return TypeDecorator;

    }
  }

  //DecoratorFactory.prototype = Object.create(annotationCls.prototype);
  return DecoratorFactory;
}

export function makeParamDecorator( annotationCls, overrideParamDecorator: Function = null ): any {

  function ParamDecoratorFactory( ...args ): any {

    // create new annotation instance with annotation decorator on proto
    const annotationInstance = Object.create( annotationCls.prototype );
    annotationCls.apply( annotationInstance, args );

    if ( this instanceof annotationCls ) {

      return annotationInstance;

    } else {

      //(ParamDecorator as any).annotation = annotationInstance;
      return ParamDecorator;

    }

    /**
     * paramDecorators are 2 dimensional arrays
     * @param cls
     * @param unusedKey
     * @param index
     * @returns {any}
     * @constructor
     */
    function ParamDecorator( cls: any, unusedKey: string, index: number ): any {

      // this is special behaviour for non constructor param Injection
      if ( isFunction( overrideParamDecorator ) && isPresent( unusedKey ) ) {

        return overrideParamDecorator( annotationInstance, cls, unusedKey, index );

      }

      let parameters: any[][] = reflector.parameters(cls);
      parameters = parameters || [];

      // there might be gaps if some in between parameters do not have annotations.
      // we pad with nulls.
      while ( parameters.length <= index ) {
        parameters.push( null );
      }

      parameters[ index ] = parameters[ index ] || [];

      const annotationsForParam: any[] = parameters[ index ];
      annotationsForParam.push( annotationInstance );

      reflector.registerParameters(parameters,cls);

      return cls;

    }

  }

  //ParamDecoratorFactory.prototype = Object.create(annotationCls.prototype);

  return ParamDecoratorFactory;

}

export function makePropDecorator( decoratorCls ): any {

  function PropDecoratorFactory( ...args ): any {

    var decoratorInstance = Object.create( decoratorCls.prototype );
    decoratorCls.apply( decoratorInstance, args );

    if ( this instanceof decoratorCls ) {

      return decoratorInstance;

    } else {

      return function PropDecorator( target: any, name: string ) {

        let meta = reflector.propMetadata(target.constructor);

        meta = meta || {};
        meta[ name ] = meta[ name ] || [];
        meta[ name ].unshift( decoratorInstance );

        reflector.registerPropMetadata(meta,target.constructor);


      };

    }

  }

  //PropDecoratorFactory.prototype = Object.create(decoratorCls.prototype);

  return PropDecoratorFactory;

}
