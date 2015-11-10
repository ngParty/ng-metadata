import angular from './facade';
import {hasInjectables,makeSelector,firstLowerCase,is} from './util';

import {getLifecycleMethod,LifecycleHooks} from './life_cycle';

type Binding = {[key:string]:string};
const BINDING_TOKENS = { attr: '@', prop: '=', onExpr: '&' };


interface DirectiveFactory {
  (
    obj: {
      selector: string
    }
  ): ClassDecorator;
}
interface DirectiveConfigStatic {
  selector: string,
  _ddo: ng.IDirective
}
const DDO_NAME = '_ddo';

export function Directive(
  {selector, legacy={}}:{
    selector: string,
    legacy?: ng.IDirective
  }
): ClassDecorator {

  if ( typeof selector !== 'string' ) {
    throw Error( `@Directive: must have 'selector' property` );
  }

  return _directiveDecorator;

  function _directiveDecorator( Type: any ) {

    _decorateDirectiveType( Type, selector, legacy, _createDdo );

  }

  function _createDdo( Type ) {

    const ddoInternal = {
      restrict: 'A',
      controller: Type,
      require: _initRequire( selector ),
      link: _postLinkFactory( true )
    };

    if ( legacy.require ) {

      ddoInternal.require = _processRequire( ddoInternal, legacy );

    }

    return ddoInternal;

  }

}

export function makeDirective( Type: any ): ng.IDirectiveFactory {

  if ( !isDirective( Type ) ) {

    throw Error( `${Type} must be @Component/@Directive` );

  }

  return _directiveFactory;

  function _directiveFactory() {

    return Type._ddo;

  }

}

export function Component(
  { selector, template, templateUrl, inputs, attrs, outputs, legacy={} }: {
    selector: string,
    template?: string,
    templateUrl?: string,
    inputs?: string[],
    outputs?: string[],
    attrs?: string[],
    legacy?: ng.IDirective
  }
): ClassDecorator {

  return _componentDecorator;

  function _componentDecorator( Type: any ) {

    if ( template && templateUrl ) {
      throw Error( 'only template or templateUrl is allowed, nod both' );
    }

    _decorateDirectiveType( Type, selector, legacy, _createDdo );

  }

  function _createDdo( Type ) {

    const ddoInternal: ng.IDirective = {
      restrict: 'E',
      controller: Type,
      controllerAs: 'ctrl',
      scope: {},
      bindToController: _getTypeBindings( Type ) || {},
      transclude: true,
      require: _initRequire( selector ),
      link: _postLinkFactory( false )
    };

    if ( attrs || inputs || outputs ) {

      const {attr,input,output} = _createBindings( { inputs, attrs, outputs } );
      ddoInternal.bindToController = angular.extend( {}, ddoInternal.bindToController, attr, input, output );

    }
    if ( legacy.require ) {

      ddoInternal.require = _processRequire( ddoInternal, legacy );

    }
    if ( template ) {
      ddoInternal.template = template;
    }
    if ( templateUrl ) {
      ddoInternal.templateUrl = templateUrl;
    }

    return ddoInternal;

  }

}

enum ComponentPropertyDecorators{
  output,
  input,
  attr
}
function _getPropertyDecoratorType( type: number ): string {
  return ComponentPropertyDecorators[ type ];
}
export function Output( bindingPropertyName?: string ): PropertyDecorator {
  return _propertyDecoratorFactoryCreator(
    bindingPropertyName,
    _getPropertyDecoratorType( ComponentPropertyDecorators.output )
  );
}
export function Input( bindingPropertyName?: string ): PropertyDecorator {
  return _propertyDecoratorFactoryCreator(
    bindingPropertyName,
    _getPropertyDecoratorType( ComponentPropertyDecorators.input )
  );
}
export function Attr( bindingPropertyName?: string ): PropertyDecorator {
  return _propertyDecoratorFactoryCreator(
    bindingPropertyName,
    _getPropertyDecoratorType( ComponentPropertyDecorators.attr )
  );
}
function _propertyDecoratorFactoryCreator( bindingPropertyName: string, propertyType: string ) {

  return _propertyDecoratorFactory;

  function _propertyDecoratorFactory( target: Object, propertyKey: string ) {

    const Type = target.constructor;
    const existingBindings = _getTypeBindings( Type );

    const format = _createArrayMapFromPropertyDecorator( propertyKey, bindingPropertyName );
    const binding = _createBindings( { [`${propertyType}s`]: format } )[ propertyType ];

    if ( existingBindings ) {
      angular.extend( existingBindings, binding );
    } else {
      Type[ DDO_NAME ] = { bindToController: binding };
    }

  }

}
function _createArrayMapFromPropertyDecorator( propertyKey: string, bindingName?: string ): string[] {

  return bindingName
    ? [ `${propertyKey}:${bindingName}` ]
    : [ propertyKey ];

}
function _hasTypeBindings( Type ): boolean {
  return Type._ddo !== undefined && typeof Type._ddo.bindToController === 'object';
}
function _getTypeBindings( Type ): {} {
  return (Type._ddo && Type._ddo.bindToController) || null;
}
function _decorateDirectiveType( Type, selector, legacy, ddoCreator: Function ) {
  const ddo = ddoCreator( Type );
  const _ddo = angular.extend( {}, ddo, legacy );
  const staticConfig: DirectiveConfigStatic = {
    selector,
    _ddo
  };

  angular.extend( Type, staticConfig );
}

function _postLinkFactory( isDirective: boolean ) {

  return _postLink;

  function _postLink( scope, element, attrs, controller: any[] ) {

    const [ownCtrl, ...requiredCtrls] = controller;

    const afterContentInitMethod = getLifecycleMethod( LifecycleHooks.AfterContentInit );

    if ( requiredCtrls.length > 0 ) {

      _checkLifecycle(
        afterContentInitMethod,
        ownCtrl,
        true,
        requiredCtrls
      ) && ownCtrl[ afterContentInitMethod ]();

    } else {

      _checkLifecycle(
        afterContentInitMethod,
        ownCtrl,
        isDirective,
        requiredCtrls
      ) && ownCtrl[ afterContentInitMethod ]();

    }

  }

}

function _createBindings(
  {inputs, attrs, outputs}:{
    inputs?: string[],
    attrs?: string[],
    outputs?: string[]
  }
) {

  const attr = (attrs && _parseFields( attrs, 'attr' )) || {};
  const input = (inputs && _parseFields( inputs, 'prop' )) || {};
  const output = (outputs && _parseFields( outputs, 'onExpr' )) || {};

  return { attr, input, output };

}

function _parseFields( fields: string[], type: string ): Binding {

  if ( BINDING_TOKENS[ type ] === undefined ) {
    throw Error( `<${type}> doesn't exist, please provide one of : <${Object.keys( BINDING_TOKENS )}>` )
  }

  return fields.reduce( ( acc, binding )=> {

    const {key,value} = _getBindingsMap( binding, BINDING_TOKENS[ type ] );
    acc[ key ] = value;

    return acc;

  }, {} as Binding );

}

function _getBindingsMap( binding: string, token: string ): {key:string, value: string} {

  let [internal, alias] = binding.split( ':' );
  alias = alias
    ? `${token}${alias}`
    : token;
  internal = internal.replace( token, '' );

  return { key: internal, value: alias };

}

function _initRequire( initialValue: string ): string[] {

  return [ makeSelector( initialValue ) ];

}

function _processRequire( ddoInternal, legacy ) {

  const newRequire = _getRequire( ddoInternal.require, legacy.require );
  delete legacy.require;

  return newRequire;

}
function _getRequire( internalRequire, require ) {

  if ( Array.isArray( require ) ) {
    return internalRequire.concat( require );
  }
  return internalRequire.concat( [ require ] );

}

function _checkLifecycle( lifecycleHookMethod: string, ctrl, shouldThrow = true, requiredCtrls = [] ): void | boolean {

  const method: Function = ctrl[ lifecycleHookMethod ];
  const hasLifecycleHookImplemented = typeof method === 'function';
  const hasRequiredCtrls = Boolean( requiredCtrls.length );

  if ( shouldThrow && !hasLifecycleHookImplemented ) {
    throw Error( `@Directive/@Component must implement #${lifecycleHookMethod} method` );
  }
  if ( hasRequiredCtrls && hasLifecycleHookImplemented && method.length !== 1 ) {
    throw Error( `
    @Directive/@Component #${lifecycleHookMethod} method is missing argument definition, which should be type of requires.
    ====
    define it like:
      ${lifecycleHookMethod}(controllers:[ng.IModelController,MyFooCtrl]){
        const [ngModel,myFoo] = controllers;
      }
    ===
    ` );

  }

  return hasLifecycleHookImplemented;

}


// custom type guards
export function isDirective( Type ) {
  return is( Type, 'selector' );
}

