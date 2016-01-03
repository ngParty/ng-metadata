import {Type,stringify} from '../facade/lang';
import {isFunction} from "../facade/lang";
import {reflector} from "../reflection/reflection";
import {isString} from "../facade/lang";
import {isArray} from "../facade/lang";
import {isType} from "../facade/lang";
import {getTypeName} from "../facade/lang";
import {PipeMetadata} from "../pipes/metadata";
import {DirectiveMetadata} from "../directives/metadata_directives";
import {InjectableMetadata} from "./metadata";
import {resolveDirectiveNameFromSelector} from "../facade/lang";
import {InjectMetadata} from "./metadata";

/**
 * should extract the string token from provided Type and add $inject angular 1 annotation to constructor if @Inject
 * was used
 * @param type
 * @returns {string}
 */
export function provide( type: Type | string, {useClass}:{useClass?:Type} = {} ): string {

  // create $inject annotation if needed
  const parameters = isString( type )
    ? reflector.parameters( useClass )
    : reflector.parameters( type );
  const injectTo = isString( type )
    ? useClass
    : type;

  const $inject = _getInjectStringTokens( parameters );

  if ( isArray( $inject ) ) {

    (injectTo).$inject = $inject;

  }

  return provideResolver( type );

}

/**
 * creates $inject array for @Inject only annotations
 * @param parameters
 * @returns {string[]}
 * @private
 * @internal
 */
export function _getInjectStringTokens( parameters: any[][] = [] ): string[] {

  return parameters
    .filter( ( paramMeta )=>paramMeta.length === 1 && paramMeta[ 0 ] instanceof InjectMetadata )
    .map( ( [injectMeta] )=>provideResolver( injectMeta.token ) );

}

export function provideResolver( type: Type | string ): string {

  if ( isString( type ) ) {
    return type;
  }
  if ( isType( type ) ) {

    // only the first class annotations is injectable
    const [annotation=null] = reflector.annotations( type as Type ) || [];

    if ( !annotation ) {

      return getTypeName( type );

    }

    if ( annotation instanceof PipeMetadata ) {
      return annotation.name;
    }

    if ( annotation instanceof DirectiveMetadata ) {
      return resolveDirectiveNameFromSelector( annotation.selector );
    }

    if ( annotation instanceof InjectableMetadata ) {
      return getTypeName( type );
    }

  }

}
