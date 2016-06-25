import { HostBindingsProcessed, HostListenersProcessed } from './constants';
import { StringMapWrapper } from '../../../facade/collections';
import { StringWrapper } from '../../../facade/primitives';
/**
 *
 * @param element
 * @param staticAttributes
 * @private
 */
export function _setHostStaticAttributes( element: ng.IAugmentedJQuery, staticAttributes: StringMap ): void {
  element.attr( staticAttributes );
}

/**
 *
 * @param scope
 * @param element
 * @param ctrl
 * @param hostBindings
 * @returns {Array}
 * @internal
 * @private
 */
export function _setHostBindings(
  scope: ng.IScope,
  element: ng.IAugmentedJQuery,
  ctrl: any,
  hostBindings: HostBindingsProcessed
): Function[] {

  // setup @HostBindings
  return [
    ..._createWatcherByType( 'classes', hostBindings ),
    ..._createWatcherByType( 'attributes', hostBindings ),
    ..._createWatcherByType( 'properties', hostBindings )
  ];

  /**
   * registers $scope.$watch for appropriate hostBinding
   * the watcher watches property on controller instance
   * @param type
   * @param hostBinding
   * @returns {Array}
   * @private
   */
  function _createWatcherByType( type: string, hostBinding: HostBindingsProcessed ): Function[] {

    const _watchersByType = [];

    StringMapWrapper.forEach(
      hostBinding[ type ],
      ( watchPropName: string, keyToSet: string )=> {

        _watchersByType.push(
          scope.$watch(
            ()=>ctrl[ watchPropName ],
            ( newValue )=> {

              if ( type === 'classes' ) {
                element.toggleClass( keyToSet, newValue )
              }
              if ( type === 'attributes' ) {
                element.attr( keyToSet, newValue )
              }
              if ( type === 'properties' ) {
                StringMapWrapper.setValueInPath( element[ 0 ], keyToSet, newValue )
              }
            }
          )
        )

      }
    );

    return _watchersByType;

  }

}

/**
 *
 * @param scope
 * @param element
 * @param ctrl
 * @param hostListeners
 * @internal
 * @private
 */
export function _setHostListeners(
  scope: ng.IScope,
  element: ng.IAugmentedJQuery,
  ctrl: any,
  hostListeners: HostListenersProcessed
): void {

  StringMapWrapper.forEach( hostListeners, _registerHostListener );

  function _registerHostListener( cbArray: string[], eventKey: string ): void {

    const [methodName,...methodParams] = cbArray;
    const { event, target } = _getTargetAndEvent( eventKey, element );

    // console.log( event );
    target.on( event, eventHandler );

    // global event
    if ( target !== element ) {
      scope.$on( '$destroy', () => target.off( event as any, eventHandler ) );
    }

    function eventHandler( evt ) {

      const cbParams: any[] = _getHostListenerCbParams( evt, methodParams );

      scope.$applyAsync( ()=> {

        const noPreventDefault = ctrl[ methodName ]( ...cbParams );

        // HostListener event.preventDefault if method returns false
        if ( noPreventDefault === false ) {
          evt.preventDefault();
        }

      } );

    }

  }

}

/**
 * return $event or it's property if found via path
 * @param event
 * @param eventParams
 * @returns {Array}
 * @private
 */
export function _getHostListenerCbParams( event: any, eventParams: string[] ): any[] {

  const ALLOWED_EVENT_NAME = '$event';

  return eventParams.reduce(
    ( acc, eventPath: string )=> {

      if ( !StringWrapper.startsWith( eventPath, ALLOWED_EVENT_NAME ) ) {
        throw new Error( `
              only $event.* is supported. Please provide correct listener parameter @example: $event,$event.target
              ` );
      }

      if ( eventPath === ALLOWED_EVENT_NAME ) {
        return [ ...acc, event ];
      }

      return [ ...acc, StringMapWrapper.getValueFromPath( event, eventPath.replace( ALLOWED_EVENT_NAME, '' ) ) ];

    },
    []
  );
}

function _getGlobalTargetReference( $injector: ng.auto.IInjectorService, targetName: string ): ng.IAugmentedJQuery {

  const globalEventTargets = [ 'document', 'window', 'body' ];
  const $document = $injector.get<ng.IDocumentService>( `$document` );

  if ( targetName === 'document' ) {
    return $document;
  }

  if ( targetName === 'window' ) {
    return angular.element( $injector.get<ng.IWindowService>( `$${targetName}` ) );
  }

  if ( targetName === 'body' ) {
    return angular.element($document[ 0 ][ targetName ]);
  }

  throw new Error(`unsupported global target '${targetName}', only '${globalEventTargets}' are supported`)
}

/**
 *
 * @param definedHostEvent this will be just simple 'event' string name or 'globalTarget:event'
 * @param hostElement
 * @returns {any}
 * @private
 */
function _getTargetAndEvent(
  definedHostEvent: string,
  hostElement: ng.IAugmentedJQuery
): {event: string,target: ng.IAugmentedJQuery} {

  // global target
  const eventWithGlobalTarget = definedHostEvent.split(/\s*:\s*/);

  if ( eventWithGlobalTarget.length === 2 ) {
    const [globalTarget,eventOnTarget] = eventWithGlobalTarget;

    return {
      event: eventOnTarget,
      target: _getGlobalTargetReference( hostElement.injector(), globalTarget )
    };
  }

  return {
    event: definedHostEvent,
    target: hostElement
  };
}
