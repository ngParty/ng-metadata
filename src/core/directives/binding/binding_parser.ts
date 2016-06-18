import { StringMapWrapper } from '../../../facade/collections';
import { ParsedBindings, BINDING_MODE, ParsedBindingsMap, INPUT_MODE_REGEX } from './constants';

export interface AttrProp {
  prop: string;
  attr: string;
  bracketAttr: string;
  bracketParenAttr: string;
  parenAttr: string;
}

export interface ComponentInfo {
  inputs: AttrProp[];
  outputs: AttrProp[];
}

export function setupFields( $attrs: ng.IAttributes, inputs = [], outputs = [], attrs = [] ) {

}

export function getComponentInfo( { inputs = [], outputs = [] }={} ): ComponentInfo {
  return {
    inputs: _parseFields( inputs ),
    outputs: _parseFields( outputs )
  };
}

export function _parseFields(names: string[]): AttrProp[] {
  const attrProps: AttrProp[] = [];
  if ( !names ) {
    return attrProps;
  }

  for ( var i = 0; i < names.length; i++ ) {
    const parts = names[ i ].split( ':' );
    const prop = parts[ 0 ].trim();
    const attr = (parts[ 1 ] || parts[ 0 ]).trim();
    attrProps.push( {
      prop: prop,
      attr: attr,
      bracketAttr: `[${attr}]`,
      parenAttr: `(${attr})`,
      bracketParenAttr: `[(${attr})]`
    } );
  }
  return attrProps;
}

export function _setupInputs( inputs: AttrProp[], $attrs: ng.IAttributes ) {
  const _attrs = {};
  const _inputs = {};

  for (var i = 0; i < inputs.length; i++) {
    const input = inputs[i];

    if ( input.attr.charAt( 0 ) === '@' || input.attr.charAt( 0 ) === '<' || input.attr.charAt( 0 ) === '=' ) {
      _attrs[input.prop] = { mode: input.attr.charAt( 0 ), exp: $attrs[input.attr], optional: true };
      return;
    }

    if ($attrs.hasOwnProperty(input.attr)) {
      // @
      _attrs[input.prop] = { mode: '@', exp: $attrs[input.attr], optional: true };
    } else if ($attrs.hasOwnProperty(input.bracketAttr)) {
      // <
      _inputs[input.prop] = { mode: '<', exp: $attrs[input.bracketAttr], optional: true };
    } else if ($attrs.hasOwnProperty(input.bracketParenAttr)) {
      // =
      _inputs[input.prop] = { mode: '=', exp: $attrs[input.bracketParenAttr], optional: true };
    }
  }

  return {
    inputs: _inputs,
    attrs: _attrs
  };

}

export function _setupOutputs( outputs: AttrProp[], $attrs: ng.IAttributes ) {
  const _outputs = {};
  for (var i = 0; i < outputs.length; i++) {
    const output = outputs[ i ];

    // & via event
    if ($attrs.hasOwnProperty(output.attr)) {
      _outputs[output.prop] = { mode: '&', exp: $attrs[output.attr], optional: true };
    }
    // & via (event)
    else if ($attrs.hasOwnProperty(output.parenAttr)) {
      _outputs[output.prop] = { mode: '&', exp: $attrs[output.parenAttr], optional: true };
    }
  }
  return {outputs: _outputs};
}
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
