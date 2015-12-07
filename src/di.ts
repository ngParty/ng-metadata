import {is} from './util';
import {provide} from './providers';
import {InjectableToken} from "./injectable";

/**
 * Constructor/Static Method Parameters Decorator
 * @param {string}  injectable DI service to be injected
 * @return {Function(target:Object, propertyName:string, argumentPosition:string)}
 * @constructor
 */
export function Inject( injectable: InjectableToken ): ParameterDecorator {

  return _parameterDecorator;
  /**
   *
   * @param {Object}  target The prototype of the class (Function).
   * @param {string|Symbol} propertyKey The name of the method (string | symbol).
   * @param {number} parameterIndex  The index of parameter in the list of the function's parameters (number).
   * @private
   */
  function _parameterDecorator( target: Object, propertyKey: string, parameterIndex: number ) {

    // if property key is set we are injecting into static method not to constructor
    let injectTo: any = propertyKey
      ? target[ propertyKey ]
      : target;

    const injectableString = typeof injectable === 'string'
      ? injectable
      : provide( injectable );

    injectTo.$inject = injectTo.$inject || [];
    injectTo.$inject[ parameterIndex ] = injectableString;

  }

}


