import { isFunction } from '../facade/lang';
import { getInjectableName } from '../core/di/provider';
import { StringWrapper } from '../facade/primitives';
import { isArray } from 'util';

// public helpers


export interface IRender{
  <T extends Type>(Directive: T, {jqHost, attrs, jqChildren}?: {
    jqHost?: ng.IAugmentedJQuery,
    attrs?: { [key: string]: any },
    jqChildren?: ng.IAugmentedJQuery
  }
  ):{
    compiledElement: ng.IAugmentedJQuery,
    ctrl: T
  }
}
/**
 * factory which will return function which will be used as your render method
 */
export function renderFactory( $compile: ng.ICompileService, $scope: any ) {

  return _compileAndDigest;

  function _compileAndDigest<T extends Type>(
    Directive: T,
    {jqHost, attrs, jqChildren}:{
      jqHost?: ng.IAugmentedJQuery
      attrs?: {[key:string]:any},
      jqChildren?: ng.IAugmentedJQuery
    } = {}
  ): { compiledElement: ng.IAugmentedJQuery, ctrl: T}{

    const ctrlName = getInjectableName( Directive );
    const selector = StringWrapper.kebabCase( ctrlName );

    // is Directive
    if ( jqHost ) {

      jqHost.attr( selector, '' )

    } else {
      // is Component

      const hostElement = `<${selector}></${selector}>`;
      jqHost = angular.element( hostElement );

    }

    jqHost.attr(attrs);

    if (jqChildren) {
      jqHost.append(jqChildren);
    }

    // angular api
    const compiledElement = $compile(jqHost)($scope);
    const ctrl = compiledElement.controller(ctrlName) as T;
    $scope.$apply();

    return { compiledElement, ctrl };

  }

}

export function getInput(element: ng.IAugmentedJQuery) {
  return element.find('input');
}

// ============================
// _private helpers for testing
// ============================

/**
 *
 * @internal
 */
export function createScope() {

  const scope = {
    _cb: [],
    $on( event: string, callback: Function ){
      this._cb.push( callback );
    },
    $destroy(){
      this._cb.forEach( ( cb )=>cb() );
    }
  };

  return scope;

}

/**
 *
 * @param scope
 * @param element
 * @param attrs
 * @internal
 */
export function linkFnMocks( scope, element, attrs ) {

  return {
    destroy: _destroyLink,
    link: _invokeLink
  };

  function _destroyLink() {
    scope.$destroy();
  }


  function _invokeLink( controllers, linkFn ) {

    const instances = controllers.map( ( constructorFn )=>new constructorFn() );

    linkFn( scope, element, attrs, instances );

  }

}

/**
 * @internal
 * @returns {any}
 */
export function getNg1InjectorMock(): ng.auto.IInjectorService {
  return {
    instantiate( classFactory ){
      return new classFactory();
    }
  } as ng.auto.IInjectorService;
}

/**
 * @internal
 */
export class $Scope {
  $$watchers = [];
  $$events = [];

  $watch( watchExp: Function|string, watchListener: Function ) {
    this.$$watchers.push( [ watchExp, watchListener ] );
    return function disposable() {}
  }

  $eval( expression ) {
    const toEval = expression;
    const done = 'evaluated';
    return eval( 'toEval + " " + done' );
  }
  $evalAsync(expression){
    if(isFunction(expression)){
      expression()
    }
  }

  $apply( expression? ) {
    if ( isFunction( expression ) ) {
      expression()
    }
  }

  $applyAsync(expression?){
    if(isFunction(expression)){
      expression()
    }
  }

  $on( eventName, cb ){
    this.$$events.push({eventName,cb})
  }

  $emit(eventName){

    this.$$events.forEach( eventObj=> {

      if ( eventObj.eventName === eventName ) {
        eventObj.cb();
        return;
      }

    } )

  }


}

/**
 * @internal
 */
export class $Attrs {
  $$observers = [];

  $observe( attrName, observeListener ) {
    this.$$observers.push( [ attrName, observeListener ] );
    return function disposable() {}
  }
}

/**
 *
 * @internal
 * @constructor
 */
export function ElementFactory() {

  const _$element = {
    _eventListeners:[],
    '0': {
      querySelector(selector:string){},
      querySelectorAll(selector:string){}
    },
    classList: {},
    attributes: {},
    toggleClass( className, toggle? ){
      if ( toggle ) {
        this.classList[ className ] = true;
      } else {
        delete this.classList[ className ];
      }
    },
    attr( attrName, value ){
      this.attributes[ attrName ] = value;
    },
    on(eventName:string,cb:Function){
      this._eventListeners.push({ eventName, cb } )
    },
    off(eventName?){

    },
    eq(idx:number){
      return isArray(_$element) ? _$element[idx] : _$element
    },

    // these need to be stubbed in tests
    parent(){},
    data(){},
    inheritedData(){},
    controller( ctrlName: string ){}
  };

  return _$element;

}


