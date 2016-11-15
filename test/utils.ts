import { isArray, isFunction, assign } from '../src/facade/lang';

// ============================
// _private helpers for testing
// ============================

export function createAngular1Module() {
  return {
    module( name, requires?: string[] ){
      const _m = {
        requires: [],
        name: name
      };
      if ( requires ) {
        _m.requires = requires;
        // setter
      } else {
        // getter
      }

      return {
        name: _m.name,
        requires: _m.requires,
        _configBlocks: [],
        _invokeQueue: [],
        _runBlocks: [],

        constant(n,v){ this._invokeQueue.push(['$provide','constant',[n,v]]); return this; },
        value(n,v){ this._invokeQueue.push(['$provide','value',[n,v]]); return this; },
        provider(n,v){ this._invokeQueue.push(['$provide','provider',[n,v]]); return this; },
        factory(n,v){ this._invokeQueue.push(['$provide','factory',[n,v]]); return this; },
        service(n,v){ this._invokeQueue.push(['$provide','service',[n,v]]); return this; },
        decorator(n,v){ this._configBlocks.push(['$provide','decorator',[n,v]]); return this; },

        directive(n,v){ this._invokeQueue.push(['$compileProvider','directive',[n,v]]); return this; },
        component(n,v){ this._invokeQueue.push(['$compileProvider','component',[n,v]]); return this; },

        controller(n,v){ this._invokeQueue.push(['$controllerProvider','register',[n,v]]); return this; },

        filter(n,v){ this._invokeQueue.push(['$filterProvider','register',[n,v]]); return this; },


        animation(n,v){ this._invokeQueue.push(['$animateProvider','register',[n,v]]); return this; },

        config(v){ this._configBlocks.push(['$injector','invoke',[v]]); return this; },
        run(v){ this._runBlocks.push(v); return this; },
      }

    }
  }
}

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
        case '$document':
          return $DocumentStatic;
        case '$window':
          return new $Window();
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
  $$postDigestQueue = [];
  $$applyAsyncQueue = [];
  $$asyncQueue = [];
  $$watchersCount = 0;
  $$listenerCount = {} as any;
  $$listeners = {} as any;
  $$destroyed = false;
  $$childHead = {} as any;
  $$childTail = {} as any;
  $$prevSibling = {} as any;
  $$nextSibling = {} as any;
  $$postDigest = ( callback: Function ): void => {};

  $digest() {}

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

export class $Document {

  static $element = ElementFactory() as any;
  constructor() {
    $Document.$element[ 0 ].body = {};
    assign( this, $Document.$element );
  }

}

export class $Window {}
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
      if(!eventName) this._eventListeners = [];
    },
    eq(idx:number){
      return isArray(_$element) ? _$element[idx] : _$element
    },

    // these need to be stubbed in tests
    parent(){},
    data(){},
    inheritedData(){},
    injector(){
      return $InjectorStatic
    },
    controller( ctrlName: string ){},
    remove(){
      this._eventListeners.forEach(function(evtHandler:{eventName:string, cb:Function}) {
        if(evtHandler.eventName === "$destroy") evtHandler.cb();
      });
    }
  };

  return _$element;

}

const $DocumentStatic = new $Document();
export const $InjectorStatic = getNg1InjectorMock();
