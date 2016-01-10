import {Type, isPresent, isBlank, stringify, assign} from '../../facade/lang';
import {StringMapWrapper, ListWrapper} from "../../facade/collections";
import {reflector} from '../reflection/reflection';
import {
  DirectiveMetadata,
  ComponentMetadata,
  InputMetadata,
  AttrMetadata,
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
import {InjectMetadata,HostMetadata,SelfMetadata,SkipSelfMetadata,OptionalMetadata} from "../di/metadata";
import {ParamMetaInst,PropMetaInst} from '../di/provider';

function _isDirectiveMetadata( type: any ): boolean {
  return type instanceof DirectiveMetadata;
}

function _transformInjectedDirectivesMeta( paramsMeta: ParamMetaInst[] ): StringMap {

  if ( paramsMeta.length < 2 ) {
    return;
  }

  const injectInst = ListWrapper.find( paramsMeta, param=>param instanceof InjectMetadata ) as InjectMetadata;
  const isHost = ListWrapper.find( paramsMeta, param=>param instanceof HostMetadata ) !== -1;

  if ( !(isHost || injectInst) ) {
    return;
  }

  if ( !injectInst.token ) {
    throw new Error( 'no Directive instance name provided within @Inject()' );
  }

  const isOptional = ListWrapper.findIndex( paramsMeta, param=>param instanceof OptionalMetadata ) !== -1;
  const isSelf = ListWrapper.findIndex( paramsMeta, param=>param instanceof SelfMetadata ) !== -1;
  const isSkipSelf = ListWrapper.findIndex( paramsMeta, param=>param instanceof SkipSelfMetadata ) !== -1;

  if ( isSelf && isSkipSelf ) {
    throw new Error( `you cannot provide both @Self() and @SkipSelf() for @Inject(${injectInst.token})` );
  }

  let locateType = '';
  let optionalType = isOptional
    ? '?'
    : '';
  if ( isHost ) {
    locateType = '^';
  }
  if ( isSelf ) {
    locateType = '';
  }
  if ( isSkipSelf ) {
    locateType = '^^';
  }

  const requireExpressionPrefix = `${optionalType}${locateType}`;
  const directiveName = injectInst.token;

  return {
    [directiveName]: `${ requireExpressionPrefix }${ directiveName }`
  };

}

/**
 * Resolve a `Type` for {@link DirectiveMetadata}.
 */
export class DirectiveResolver {
  /**
   * Return {@link DirectiveMetadata} for a given `Type`.
   */
  resolve( type: Type ): DirectiveMetadata {

    const metadata: DirectiveMetadata = this._getDirectiveMeta( type );

    const propertyMetadata: {[key: string]: PropMetaInst[]} = reflector.propMetadata( type );

    return this._mergeWithPropertyMetadata( metadata, propertyMetadata );

  }

  /**
   * transform parameter annotations to required directives map so we can use it
   * for DDO creation
   *
   * map consist of :
   *  - key == name of directive
   *  - value == Angular 1 require expression
   *
   * @param {Type} type
   * @returns {StringMap}
   */
  getRequiredDirectivesMap( type: Type ): StringMap {

    const metadata: DirectiveMetadata = this._getDirectiveMeta( type );

    const paramMetadata = reflector.parameters( type );

    if ( isPresent( paramMetadata ) ) {

      return paramMetadata
        .reduce( ( acc, paramMetaArr )=> {

          const requireExp = _transformInjectedDirectivesMeta( paramMetaArr );
          if ( isPresent( requireExp ) ) {
            assign( acc, requireExp );
          }

          return acc;

        }, {} as StringMap );

    }

    return {} as StringMap;

  }

  /**
   *
   * @param type
   * @returns {DirectiveMetadata}
   * @throws Error
   * @private
   */
  private _getDirectiveMeta( type: Type ): DirectiveMetadata {

    const typeMetadata = reflector.annotations( type );

    if ( isPresent( typeMetadata ) ) {

      const metadata: DirectiveMetadata = ListWrapper.find( typeMetadata, _isDirectiveMetadata );

      if ( isPresent( metadata ) ) {

        return metadata;

      }

    }

    throw new Error( `No Directive annotation found on ${stringify( type )}` );

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

        if ( propMetaInst instanceof InputMetadata ) {

          if ( isPresent( propMetaInst.bindingPropertyName ) ) {
            inputs.push( `${propName}: ${propMetaInst.bindingPropertyName}` );
          } else {
            inputs.push( propName );
          }

        }

        if ( propMetaInst instanceof AttrMetadata ) {

          if ( isPresent( propMetaInst.bindingPropertyName ) ) {
            attrs.push( `${propName}: ${propMetaInst.bindingPropertyName}` );
          } else {
            attrs.push( propName );
          }

        }

        if ( propMetaInst instanceof OutputMetadata ) {

          if ( isPresent( propMetaInst.bindingPropertyName ) ) {
            outputs.push( `${propName}: ${propMetaInst.bindingPropertyName}` );
          } else {
            outputs.push( propName );
          }

        }

        if ( propMetaInst instanceof HostBindingMetadata ) {

          if ( isPresent( propMetaInst.hostPropertyName ) ) {
            host[ `[${propMetaInst.hostPropertyName}]` ] = propName;
          } else {
            host[ `[${propName}]` ] = propName;
          }

        }

        if ( propMetaInst instanceof HostListenerMetadata ) {

          const args = isPresent( propMetaInst.args )
            ? propMetaInst.args.join( ', ' )
            : '';
          host[ `(${propMetaInst.eventName})` ] = `${propName}(${args})`;

        }

        if ( propMetaInst instanceof ContentChildrenMetadata ) {
          queries[ propName ] = propMetaInst;
        }

        if ( propMetaInst instanceof ViewChildrenMetadata ) {
          queries[ propName ] = propMetaInst;
        }

        if ( propMetaInst instanceof ContentChildMetadata ) {
          queries[ propName ] = propMetaInst;
        }

        if ( propMetaInst instanceof ViewChildMetadata ) {
          queries[ propName ] = propMetaInst;
        }

      } );

    } );

    return this._merge( directiveMetadata, inputs, attrs, outputs, host, queries );

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

    if ( dm instanceof ComponentMetadata ) {

      const componentSettings = assign(
        {},
        directiveSettings,
        {
          template: dm.template,
          templateUrl: dm.templateUrl
        } );

      return new ComponentMetadata( componentSettings );

    } else {

      return new DirectiveMetadata( directiveSettings );

    }

  }

}
