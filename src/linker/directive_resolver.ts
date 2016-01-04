import {Injectable} from '../di/decorators';
import {Type, isPresent, isBlank, stringify} from '../facade/lang';
import {StringMapWrapper, ListWrapper} from "../facade/collections";

import {
  DirectiveMetadata,
  ComponentMetadata,
  InputMetadata,
  OutputMetadata,
  HostBindingMetadata,
  HostListenerMetadata
} from '../directives/metadata_directives';
import {
  ContentChildrenMetadata,
  ViewChildrenMetadata,
  ContentChildMetadata,
  ViewChildMetadata
} from '../directives/metadata_di';
import {reflector} from '../reflection/reflection';
import {assign} from "../facade/lang";
import {AttrMetadata} from "../directives/metadata_directives";


type PropMetaInst =  InputMetadata | OutputMetadata | HostBindingMetadata | HostListenerMetadata;

function _isDirectiveMetadata(type: any): boolean {
  return type instanceof DirectiveMetadata;
}

/**
 * Resolve a `Type` for {@link DirectiveMetadata}.
 */
export class DirectiveResolver {
  /**
   * Return {@link DirectiveMetadata} for a given `Type`.
   */
  resolve(type: Type): DirectiveMetadata {

    const typeMetadata = reflector.annotations(type);

    if (isPresent(typeMetadata)) {

      const metadata: DirectiveMetadata = ListWrapper.find(typeMetadata, _isDirectiveMetadata);

      if (isPresent(metadata)) {

        const propertyMetadata: {[key: string]: PropMetaInst[]} = reflector.propMetadata(type);

        return this._mergeWithPropertyMetadata(metadata, propertyMetadata);

      }

    }

    throw new Error(`No Directive annotation found on ${stringify(type)}`);
  }

  private _mergeWithPropertyMetadata(
    directiveMetadata: DirectiveMetadata,
    propertyMetadata: {[key: string]: PropMetaInst[]}
  ): DirectiveMetadata {

    const inputs = [];
    const attrs = [];
    const outputs = [];
    const host: {[key: string]: string} = {};
    const queries: {[key: string]: any} = {};

    StringMapWrapper.forEach( propertyMetadata, ( metadata: PropMetaInst[], propName: string ) => {

      metadata.forEach( propMetaInst => {

        if (propMetaInst instanceof InputMetadata) {

          if (isPresent(propMetaInst.bindingPropertyName)) {
            inputs.push(`${propName}: ${propMetaInst.bindingPropertyName}`);
          } else {
            inputs.push(propName);
          }

        }

        if (propMetaInst instanceof AttrMetadata) {

          if (isPresent(propMetaInst.bindingPropertyName)) {
            attrs.push(`${propName}: ${propMetaInst.bindingPropertyName}`);
          } else {
            attrs.push(propName);
          }

        }

        if (propMetaInst instanceof OutputMetadata) {

          if (isPresent(propMetaInst.bindingPropertyName)) {
            outputs.push(`${propName}: ${propMetaInst.bindingPropertyName}`);
          } else {
            outputs.push(propName);
          }

        }

        if (propMetaInst instanceof HostBindingMetadata) {

          if (isPresent(propMetaInst.hostPropertyName)) {
            host[`[${propMetaInst.hostPropertyName}]`] = propName;
          } else {
            host[`[${propName}]`] = propName;
          }

        }

        if (propMetaInst instanceof HostListenerMetadata) {

          const args = isPresent( propMetaInst.args )
            ? propMetaInst.args.join( ', ' )
            : '';
          host[`(${propMetaInst.eventName})`] = `${propName}(${args})`;

        }

        if (propMetaInst instanceof ContentChildrenMetadata) {
          queries[propName] = propMetaInst;
        }

        if (propMetaInst instanceof ViewChildrenMetadata) {
          queries[propName] = propMetaInst;
        }

        if (propMetaInst instanceof ContentChildMetadata) {
          queries[propName] = propMetaInst;
        }

        if (propMetaInst instanceof ViewChildMetadata) {
          queries[propName] = propMetaInst;
        }

      });

    });

    return this._merge(directiveMetadata, inputs, attrs, outputs, host, queries);

  }

  private _merge(
    dm: DirectiveMetadata,
    inputs: string[],
    attrs: string[],
    outputs: string[],
    host: {[key: string]: string},
    queries: {[key: string]: any}
  ): DirectiveMetadata {

    const mergedInputs = isPresent( dm.inputs )
      ? ListWrapper.concat( dm.inputs, inputs )
      : inputs;
    const mergedAttrs = isPresent( dm.attrs )
      ? ListWrapper.concat( dm.attrs, attrs )
      : attrs;
    const mergedOutputs = isPresent( dm.outputs )
      ? ListWrapper.concat( dm.outputs, outputs )
      : outputs;
    const mergedHost = isPresent( dm.host )
      ? StringMapWrapper.merge( dm.host, host )
      : host;
    const mergedQueries = isPresent( dm.queries )
      ? StringMapWrapper.merge( dm.queries, queries )
      : queries;

    const directiveSettings = {
      selector: dm.selector,
      inputs: mergedInputs,
      attrs: mergedAttrs,
      outputs: mergedOutputs,
      host: mergedHost,
      queries: mergedQueries,
      legacy: dm.legacy
    };

    if (dm instanceof ComponentMetadata) {

      const componentSettings = assign(
        {},
        directiveSettings,
        {
          template: dm.template,
          templateUrl: dm.templateUrl
        } );

      return new ComponentMetadata(componentSettings);

    } else {

      return new DirectiveMetadata(directiveSettings);

    }

  }

}
