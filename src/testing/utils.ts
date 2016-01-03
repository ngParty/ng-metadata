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


