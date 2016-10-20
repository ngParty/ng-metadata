import { StringMapWrapper, ListWrapper } from '../../../facade/collections';
import { ParsedBindings, BINDING_MODE, ParsedBindingsMap, INPUT_MODE_REGEX } from './constants';

export interface AttrProp {
  /**
   * instance property
   */
  prop: string;
  /**
   * attr name in template ( equals prop if not aliased )
   */
  attr: string;
  bracketAttr: string;
  bracketParenAttr: string;
  parenAttr: string;
  /**
   * this is determined only for declaration time types @Input('@'),@Input('<'),@Input('=')
   */
  type: string,
  typeByTemplate: boolean
}

export interface SetupAttrField {
  mode: string,
  exp: string,
  attrName: string
}
export interface ProcessedBindings {
  inputs: {[key: string]: SetupAttrField},
  attrs: {[key: string]: SetupAttrField},
  outputs: {[key: string]: SetupAttrField}
}

export function setupFields(
  ngAttrs: ng.IAttributes,
  rawInputs: string[] = [],
  rawOutputs: string[] = []
): ProcessedBindings {
  const { inputs, attrs } = _setupInputs( _parseFields( rawInputs ), ngAttrs );
  const { outputs } = _setupOutputs( _parseFields( rawOutputs ), ngAttrs );
  return {
    inputs,
    attrs,
    outputs
  };
}

export function _parseFields(names: string[]): AttrProp[] {
  const attrProps: AttrProp[] = [];
  if ( !names ) {
    return attrProps;
  }

  for ( const name of names ) {

    const parts = name.split( ':' );
    const prop = parts[ 0 ].trim();
    const attr = (parts[ 1 ] || parts[ 0 ]).trim();

    const isTypeByDeclaration = _isTypeByDeclaration( attr );
    const attrName = _getNormalizedAttrName( attr, prop, isTypeByDeclaration );
    const type = _getBindingType(attr,isTypeByDeclaration);

    attrProps.push( {
      prop: prop,
      attr: attrName,
      bracketAttr: `[${attrName}]`,
      parenAttr: `(${attrName})`,
      bracketParenAttr: `[(${attrName})]`,
      type: type,
      typeByTemplate: !isTypeByDeclaration
    } );
  }

  return attrProps;
}

function _getBindingType( originalAttr: string, isTypeByDeclaration: boolean ): string {
  return isTypeByDeclaration
    ? originalAttr.charAt( 0 )
    : '';
}
function _isTypeByDeclaration( attr: string ): boolean {
  return ListWrapper.contains( [
    BINDING_MODE.attr, BINDING_MODE.oneWay, BINDING_MODE.twoWay
  ], attr.charAt( 0 ) );
}
function _getNormalizedAttrName( originalAttr: string, propName: string, isTypeByDeclaration: boolean ): string {
  if ( !isTypeByDeclaration ) {
    return originalAttr;
  }
  return originalAttr.length > 1
    ? originalAttr.substring( 1 )
    : propName;
}

export function _setupInputs(
  inputs: AttrProp[],
  ngAttrs: ng.IAttributes
): {inputs: {[propName: string]: SetupAttrField},attrs: {[propName: string]: SetupAttrField}} {

  const parsedAttrs: {[propName:string]:SetupAttrField} = {};
  const parsedInputs: {[propName:string]:SetupAttrField} = {};


  for ( const input of inputs ) {

    if ( input.typeByTemplate ) {

      if ( ngAttrs.hasOwnProperty( input.attr ) ) {
        // @
        parsedAttrs[ input.prop ] = {
          mode: BINDING_MODE.attr,
          exp: ngAttrs[ input.attr ],
          attrName: input.attr
        };
      } else if ( ngAttrs.hasOwnProperty( input.bracketAttr ) ) {
        // <
        parsedInputs[ input.prop ] = {
          mode: BINDING_MODE.oneWay,
          exp: ngAttrs[ input.bracketAttr ],
          attrName: input.bracketAttr
        };
      } else if ( ngAttrs.hasOwnProperty( input.bracketParenAttr ) ) {
        // =
        parsedInputs[ input.prop ] = {
          mode: BINDING_MODE.twoWay,
          exp: ngAttrs[ input.bracketParenAttr ],
          attrName: input.bracketParenAttr
        };
      }

    } else {

      if ( ngAttrs.hasOwnProperty( input.attr ) ) {
        const attrMetadata = { mode: input.type, exp: ngAttrs[ input.attr ], attrName: input.attr };
        if ( input.type === BINDING_MODE.attr ) {
          parsedAttrs[ input.prop ] = attrMetadata;
        } else {
          parsedInputs[ input.prop ] = attrMetadata;
        }
      }

    }
  }

  return {
    inputs: parsedInputs,
    attrs: parsedAttrs
  };

}

export function _setupOutputs(
  outputs: AttrProp[],
  ngAttrs: ng.IAttributes
): {outputs: {[propName: string]: SetupAttrField}} {

  const parsedOutputs = {} as {[propName:string]:SetupAttrField};

  for ( let i = 0; i < outputs.length; i = i + 1 ) {

    const output = outputs[ i ];
    const baseParsedAttrField = { mode: BINDING_MODE.output, exp: undefined, attrName:''};

    // & via event
    if ( ngAttrs.hasOwnProperty( output.attr ) ) {
      parsedOutputs[ output.prop ] = StringMapWrapper.assign(
        {},
        baseParsedAttrField,
        { exp: ngAttrs[ output.attr ], attrName: output.attr }
      );
    }
    // & via (event)
    else if ( ngAttrs.hasOwnProperty( output.parenAttr ) ) {
      parsedOutputs[ output.prop ] = StringMapWrapper.assign(
        {},
        baseParsedAttrField,
        { exp: ngAttrs[ output.parenAttr ], attrName: output.parenAttr }
      );
    }

  }

  return { outputs: parsedOutputs };
}

/**
 * parses input/output/attrs string arrays from metadata fro further processing
 * @param inputs
 * @param outputs
 * @param attrs
 * @returns {{inputs: ParsedBindingsMap, outputs: ParsedBindingsMap, attrs: ParsedBindingsMap}}
 * @private
 * @deprecated
 */
export function _parseBindings({ inputs=[], outputs=[], attrs=[] }: { inputs: string[], outputs: string[], attrs: string[] }): ParsedBindings {

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
