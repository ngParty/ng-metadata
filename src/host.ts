export type RequireMetadata = {
  id:number,
  opt:boolean,
  parent: boolean,
  name: string
};
export const REQUIRE_METADATA_KEY = '_requireDirectives';
export const OPTIONAL_REQUIRE_SIGN = '?';
export const PARENT_REQUIRE_SIGN = '^';

export function Host(): ParameterDecorator {

  return _parameterDecorator;


  function _parameterDecorator( target: any, propertyKey: string, parameterIndex: number ) {

    if ( propertyKey ) {
      throw Error( `@Host is allowed only for constructor Directive/Component injection` );
    }

    target[ REQUIRE_METADATA_KEY ] = target[ REQUIRE_METADATA_KEY ] || [];
    target[ REQUIRE_METADATA_KEY ].unshift( {
      id: parameterIndex,
      opt: false,
      parent: false,
      name: ''
    } );

  }


}
