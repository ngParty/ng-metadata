import { isPresent, assign } from '../../../facade/lang';
import { StringMapWrapper } from '../../../facade/collections';

import { HostProcessed, HostBindingsProcessed } from './constants';

const HOST_BINDING_KEY_REGEX = /^\[.*\]$/;
const HOST_LISTENER_KEY_REGEX = /^\(.*\)$/;
const HAS_CLASS_REGEX = /^class./;
const HAS_ATTR_REGEX = /^attr./;


export function _parseHost( host: StringMap ): HostProcessed {

  if ( !isPresent( host ) ) {
    return;
  }

  const hostStatic = {} as StringMap;
  const hostBindingsRaw = [];
  const hostListeners = {} as {[key:string]:string[]};

  StringMapWrapper.forEach( host, ( hostValue: string, hostKey: string )=> {

    const hostMap: StringMap = { [stripBindingOrListenerBrackets( hostKey )]: hostValue };

    if ( isStaticHost( hostKey ) ) {
      assign( hostStatic, hostMap );
      return;
    }
    if ( isHostBinding( hostKey ) ) {
      hostBindingsRaw.push( hostMap );
      return;
    }
    if ( isHostListener( hostKey ) ) {
      assign( hostListeners, processHostListenerCallback( hostMap ) );
    }

  } );

  const hostBindings: HostBindingsProcessed = hostBindingsRaw
    .reduce(
      ( acc, hostBindingObj )=> {

        const [hostObjKey] = Object.keys( hostBindingObj );
        const hostObjValue = hostBindingObj[ hostObjKey ];

        if ( HAS_CLASS_REGEX.test( hostObjKey ) ) {
          acc.classes[ hostObjKey.replace( HAS_CLASS_REGEX, '' ) ] = hostObjValue;
          return acc;
        }

        if ( HAS_ATTR_REGEX.test( hostObjKey ) ) {

          acc.attributes[ hostObjKey.replace( HAS_ATTR_REGEX, '' ) ] = hostObjValue;
          return acc;
        }

        assign( acc.properties, hostBindingObj );

        return acc;
      },
      {
        classes: {},
        attributes: {},
        properties: {}
      }
    );

  return {
    hostStatic,
    hostBindings,
    hostListeners
  };

  function isHostBinding( hostKey ) {
    return HOST_BINDING_KEY_REGEX.test( hostKey );
  }

  function isHostListener( hostKey ) {
    return HOST_LISTENER_KEY_REGEX.test( hostKey );
  }

  function isStaticHost( hostKey ) {
    return !(isHostBinding( hostKey ) || isHostListener( hostKey ));
  }

  function stripBindingOrListenerBrackets( hostKey ): string {
    return hostKey.replace( /\[|\]|\(|\)/g, '' );
  }

  function processHostListenerCallback( hostListener: {[key:string]:string} ): {[key:string]:string[]} {

    // eventKey is 'click' or 'document: click' etc
    const [eventKey] = Object.keys( hostListener );
    // cbString is just value 'onMove($event.target)' or 'onMove()'
    const cbString = hostListener[ eventKey ];
    // here we parse out callback method and its argument to separate strings
    // - for instance we got from 'onMove($event.target)' --> 'onMove','$event.target'
    const [,cbMethodName,cbMethodArgs] = /^(\w+)\(([$\w.\s,]*)\)$/.exec( cbString );
    const eventValue = [
      cbMethodName,
      // filter out empty values and trim values
      ...cbMethodArgs.split( ',' ).filter( argument=>Boolean( argument ) ).map( argument=>argument.trim() )
    ];

    return {
      [eventKey.replace( /\s/g, '' )]: eventValue
    };
  }

}
