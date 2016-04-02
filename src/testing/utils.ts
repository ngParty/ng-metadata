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


function __injectionArgs(fn, locals, serviceName){
  var args = [],
    $inject = fn.$inject;

  for ( var i = 0, length = $inject.length; i < length; i++ ) {
    var key = $inject[ i ];
    if ( typeof key !== 'string' ) {
      throw new Error( `itkn, Incorrect injection token! Expected service name as string, got ${key}', ` );
    }
    args.push( locals[ key ] );
  }
  return args;
}
/**
 * @internal
 * @returns {any}
 */
export function getNg1InjectorMock(): ng.auto.IInjectorService {
  return {
    instantiate( classFactory ){
      return new classFactory();
    },
    invoke(fn: Function, context?: any, locals?: any){

      let serviceName;
      if (typeof locals === 'string') {
        serviceName = locals;
        locals = null;
      }

      var args = __injectionArgs(fn, locals, serviceName);
      if (isArray(fn)) {
        fn = fn[fn.length - 1];
      }

      // if (!isClass(fn)) {
        // http://jsperf.com/angularjs-invoke-apply-vs-switch
        // #5388

        return fn.apply(context, args);
      // } else {
      //   args.unshift(null);
      //   return new (Function.prototype.bind.apply(fn, args))();
      // }

      // const argArray = StringMapWrapper.values( locals );
      // func.apply(context,argArray);

    },
    get( token: string ){
      switch ( token ) {
        case '$parse':
          return new $Parse();
        case '$interpolate':
          return new $Interpolate();
        default:
          return {};
      }
    }
  } as ng.auto.IInjectorService;
}

export class $Parse{
  constructor(){
    return (expression)=>{
      (parseGet as any).literal = false;
      function parseGet(context){
        if(isFunction(expression)){
          return eval("expression()")
        }else{
          const toEval = expression || '';
          const done = 'evaluated';
          return eval( 'toEval + " " + done' );
        }
      }
      return parseGet;

    }
  }
}
export class $Interpolate{
  constructor(){
    return (expression)=>{
      return (context)=>{
        return eval('expression');
      }
    }
  }
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
    const toEval = expression || '';
    const done = 'evaluated';
    return eval( 'toEval + " " + done' );
  }
  $evalAsync(expression){
    if(isFunction(expression)){
      return eval("expression()")
    }else{
      return this.$eval(expression);
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
  constructor(private attrs?){}
  $$observers = [];

  $observe( attrName, observeListener ) {

    if ( !isArray( this.$$observers[ attrName ] ) ) {
      this.$$observers[ attrName ] = [];
      this.$$observers[ attrName ].$$scope = null;
      this.$$observers[ attrName ].$$element = null;
    }
    this.$$observers[ attrName ].push( observeListener );

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


