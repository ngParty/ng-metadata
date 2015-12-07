import { provide } from './providers';
import { InjectableToken } from "./injectable";

/**
 *
 * A parameter decorator that declares the dependencies to be injected in to the class' constructor, static or regular method.
 *
 * @example
 * ```ts
 * import { Inject, Component } from 'ng-metadata/ng-metadata';
 * import { MyService } from './myService';
 *
 * @Component({...})
 * class MyCmp {
 *
 *  // MyService is custom service so we can inject it by reference
 *  constructor(
 *    @Inject('$q') private $q,
 *    @Inject('$element') private $element,
 *    @Inject(MyService) private myService
 *  ){}
 *
 *  // also works on static methods
 *  static foo(@Inject('$log') $log) {}
 *
 *  // also works on regular methods
 *  regularOne(@Inject('$log') $log) {}
 *
 *}
 *
 * expect(MyCmp.$inject).to.equal(['$q','$element','myService'])
 * expect(MyCmp.foo.$inject).to.equal(['$log'])
 * expect(MyCmp.prototype.regularOne.$inject).to.equal(['$log'])
 * ```
 *
 * ###### Behind the scenes:
 *
 * The injectables are added to the $inject property of the class constructor function.
 *
 * Constructor/Static Method/Method Parameters Decorator
 * @param {string|Function}  injectable DI service token to be injected
 * - If string, then it's considered a core angular service such as $q or $http. It could also be a special 'local', for example component's can inject $element, $attrs or $scope
 * - If class, then it's considered to be a custom class(service)
 * @returns {ParameterDecorator}
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


