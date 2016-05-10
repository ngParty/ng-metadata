export const INPUT_MODE_REGEX = /^(<|=|@)?(\??)(\w*)$/;
export const BINDING_MODE = Object.freeze( {
  oneWay: '<',
  twoWay: '=',
  output: '&',
  attr: '@',
  optional: '?'
} );

export type ParsedBindingValue = { mode: string, alias: string, optional: boolean}
export type ParsedBindingsMap = {[name: string]: ParsedBindingValue};
export type ParsedBindings = {
  inputs: ParsedBindingsMap,
  outputs: ParsedBindingsMap,
  attrs: ParsedBindingsMap,
  [key: string]: ParsedBindingsMap
};
