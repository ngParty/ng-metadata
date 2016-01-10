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
  return {
    _eventListeners:[],
    '0': {},
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

    }
  }
}


