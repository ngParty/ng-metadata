import { StringMapWrapper } from '../../../facade/collections';
import { ParsedBindings, BINDING_MODE, ParsedBindingsMap, INPUT_MODE_REGEX } from './constants';

/**
 * parses input/output/attrs string arrays from metadata fro further processing
 * @param inputs
 * @param outputs
 * @param attrs
 * @returns {{inputs: ParsedBindingsMap, outputs: ParsedBindingsMap, attrs: ParsedBindingsMap}}
 * @private
 */
export function _parseBindings({ inputs=[], outputs=[], attrs=[] }): ParsedBindings {
  
  const SPLIT_BY = ':';

  return {
    inputs: _parseByMode( inputs, BINDING_MODE.twoWay, [ BINDING_MODE.attr ] ),
    outputs: _parseByMode( outputs, BINDING_MODE.output ),
    attrs: StringMapWrapper.merge(
      // this will be removed in 2.0
      _parseByMode( attrs, BINDING_MODE.attr ),
      // attrs build from @Input('@')
      _parseByMode( inputs, BINDING_MODE.twoWay, [ BINDING_MODE.oneWay, BINDING_MODE.twoWay ] )
    )
  };

  function _parseByMode( bindingArr: string[], defaultMode: string, excludeMode: string[] = [] ): ParsedBindingsMap {

    return bindingArr.reduce( ( acc, binding: string )=> {

      const [name,modeConfigAndAlias=''] = binding.split( SPLIT_BY ).map( part=>part.trim() );
      const parsedConfigAndAlias = modeConfigAndAlias.match( INPUT_MODE_REGEX );
      const [, mode=defaultMode, optional='', alias=''] = parsedConfigAndAlias || [];

      // exit early if processed mode is not allowed
      // for example if we are parsing Input('@') which produces attr binding instead of one or two way
      if ( excludeMode.indexOf( mode ) !== -1 ) {
        return acc;
      }

      // @TODO remove this in next version where template parsing will be implemented
      if ( (defaultMode !== BINDING_MODE.output) && !(parsedConfigAndAlias && parsedConfigAndAlias[ 1 ]) ) {
        console.warn( `
        You need to explicitly provide type of binding(=,<,@) within your <code>'@Input() ${name};</code>.
        Next version 2.0 will create binding by parsing template if you provide '@Input()' without binding type.
        ` )
      }

      acc[ name ] = {
        mode,
        alias,
        optional: optional === BINDING_MODE.optional || true
      };

      return acc;

    }, {} as StringMap );
  }
}
