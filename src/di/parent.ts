import {REQUIRE_METADATA_KEY,RequireMetadata} from './host';

export function Parent(): ParameterDecorator {

  return _parameterDecorator;

  function _parameterDecorator( target: Object, propertyKey: string, parameterIndex: number ) {

    if ( propertyKey ) {
      throw Error( `@Parent is allowed only for constructor Directive/Component injection` );
    }

    target[ REQUIRE_METADATA_KEY ] = target[ REQUIRE_METADATA_KEY ] || [];
    target[ REQUIRE_METADATA_KEY ].unshift( {
      id: parameterIndex,
      opt: false,
      parent: true,
      name: ''
    } );

  }

}
