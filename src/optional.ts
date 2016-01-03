import { assign } from './facade/lang';
import {REQUIRE_METADATA_KEY,RequireMetadata} from './host';


export function Optional(): ParameterDecorator{

  return _parameterDecorator;

  function _parameterDecorator(target: Object, propertyKey: string, parameterIndex: number){

    if(!Array.isArray(target[REQUIRE_METADATA_KEY])){

      target[REQUIRE_METADATA_KEY] = [{
        id: parameterIndex,
        opt: false,
        parent: false
      }];

    }else{

      const directiveRequire = target[ REQUIRE_METADATA_KEY ].reduce( ( acc, value, idx )=> {

        if ( value.id === parameterIndex ) {

          acc.metadata = value;
          acc.index = idx;

        }

        return acc;

      }, {} as {metadata:REQUIRE_METADATA_KEY,index:number} );

      if ( directiveRequire.metadata ) {

        directiveRequire.metadata.opt = true;

        target[ REQUIRE_METADATA_KEY ][ directiveRequire.index ] = assign( {}, directiveRequire.metadata );

      }

    }

  }

}
