import { StringMapWrapper } from '../../../facade/collections';
import { Type } from '../../../facade/type';
import { EventEmitter } from '../../../facade/async';
import { DirectiveMetadata, ComponentMetadata } from '../metadata_directives';
import { ChangeDetectorRef } from '../../change_detection/change_detector_ref';
import { _createDirectiveBindings } from '../binding/binding_factory';
import { isAttrDirective } from '../directives_utils';
import { isFunction, isJsObject, isArray, getFuncName, isString } from '../../../facade/lang';
import { StringWrapper } from '../../../facade/primitives';
import { DirectiveCtrl, NgmDirective } from '../constants';
import { REQUIRE_PREFIX_REGEXP } from './constants';

export function directiveControllerFactory<T extends DirectiveCtrl,U extends Type>(
  caller: T,
  controller: U,
  $injector: ng.auto.IInjectorService,
  locals: {
    $scope: ng.IScope,
    $element: ng.IAugmentedJQuery,
    $attrs: ng.IAttributes,
    $transclude: ng.ITranscludeFunction
  },
  requireMap: StringMap,
  _ddo: NgmDirective,
  metadata: DirectiveMetadata | ComponentMetadata
): T & U {

  const { $scope, $element, $attrs } = locals;
  const _services = {
    $parse: $injector.get<ng.IParseService>( '$parse' ),
    $interpolate: $injector.get<ng.IInterpolateService>( '$interpolate' ),
    $rootScope: $injector.get<ng.IRootScopeService>( '$rootScope' )
  };
  const _localServices = {
    changeDetectorRef: ChangeDetectorRef.create( $scope )
  };

  // Create an instance of the controller without calling its constructor
  const instance: T & U = Object.create( controller.prototype );

  // NOTE: this is not needed because we are creating bindings manually because of
  // angular behaviour https://github.com/ngParty/ng-metadata/issues/53
  // ===================================================================
  // Remember, angular has already set those bindings on the `caller`
  // argument. Now we need to extend them onto our `instance`. It is important
  // to extend after defining the properties. That way we fire the setters.
  //
  // StringMapWrapper.assign( instance, caller );

  // setup @Input/@Output/@Attrs for @Component/@Directive
  const { removeWatches, initialChanges } = _createDirectiveBindings(
    !isAttrDirective( metadata ),
    $scope,
    $attrs,
    instance,
    metadata,
    _services
  );
  cleanUpWatchers( removeWatches );

  // change injectables to proper inject directives
  // we wanna do this only if we inject some locals/directives
  if ( StringMapWrapper.size( requireMap ) ) {
    controller.$inject = createNewInjectablesToMatchLocalDi( controller.$inject, requireMap );
  }

  const $requires = getEmptyRequiredControllers( requireMap );

  // $injector.invoke will delete any @Input/@Attr/@Output which were resolved within _createDirectiveBindings
  // and which have set default values in constructor. We need to store them and reassign after this invoke
  const initialInstanceBindingValues = getInitialBindings( instance );

  // Finally, invoke the constructor using the injection array and the captured locals
  $injector.invoke( controller, instance, StringMapWrapper.assign( locals, _localServices, $requires ) );

  // reassign back the initial binding values, just in case if we used default values
  StringMapWrapper.assign( instance, initialInstanceBindingValues );


  /*if ( isFunction( instance.ngOnDestroy ) ) {
   $scope.$on( '$destroy', instance.ngOnDestroy.bind( instance ) );
   }*/

  /*if (typeof instance.ngAfterViewInit === 'function') {
   ddo.ngAfterViewInitBound = instance.ngAfterViewInit.bind(instance);
   }*/

  // https://github.com/angular/angular.js/commit/0ad2b70862d49ecc4355a16d767c0ca9358ecc3e
  // onChanges is called before onInit
  if ( isFunction( instance.ngOnChanges ) ) {
    instance.ngOnChanges( initialChanges );
  }

  _ddo._ngOnInitBound = function _ngOnInitBound() {

    // invoke again only if there are any directive requires
    // #perf
    if ( StringMapWrapper.size( requireMap ) ) {
      const $requires = getRequiredControllers( requireMap, $element, controller );

      // $injector.invoke will delete any @Input/@Attr/@Output which were resolved within _createDirectiveBindings
      // and which have set default values in constructor. We need to store them and reassign after this invoke
      const initialInstanceBindingValues = getInitialBindings( instance );

      $injector.invoke( controller, instance, StringMapWrapper.assign( locals, _localServices, $requires ) );

      // reassign back the initial binding values, just in case if we used default values
      StringMapWrapper.assign( instance, initialInstanceBindingValues );
    }

    if ( isFunction( instance.ngOnInit ) ) {
      instance.ngOnInit()
    }

    // DoCheck is called after OnChanges and OnInit
    if ( isFunction( instance.ngDoCheck ) ) {
      const removeDoCheckWatcher = $postDigestWatch( $scope, () => instance.ngDoCheck() );
      cleanUpWatchers( removeDoCheckWatcher );
    }

  };

  // Return the controller instance
  return instance;

  function cleanUpWatchers( cb: Function ): void {
    $scope.$on( '$destroy', () => cb );
  }

}


/**
 * Note: $$postDigest will not trigger another digest cycle.
 * So any modification to $scope inside $$postDigest will not get reflected in the DOM
 */
function $postDigestWatch( scope: ng.IScope, cb: Function ): Function {
  let hasRegistered = false;
  const removeDoCheckWatcher = scope.$watch( () => {
    if ( hasRegistered ) { return }
    hasRegistered = true;
    scope.$$postDigest( () => {
      hasRegistered = false;
      cb();
    } );
  } );

  return removeDoCheckWatcher;
}

function getInitialBindings( instance ): {[propName: string]: any} {
  const initialBindingValues = {};
  StringMapWrapper.forEach( instance, ( value: any, propName: string ) => {
    if ( instance[ propName ] ) {
      initialBindingValues[ propName ] = value;
    }
  } );
  return initialBindingValues;
}


/**
 * Angular 1 copy of how to require other directives
 * @param require
 * @param $element
 * @param directive
 * @returns {any|null}
 */
export function getRequiredControllers(
  require: string|string[]|{[key:string]:any},
  $element: ng.IAugmentedJQuery,
  directive: Type
): Object|Object[]|{[ctrlName:string]:Object} {

  var value;

  if (isString(require)) {
    var match = require.match(REQUIRE_PREFIX_REGEXP);
    var name = require.substring(match[0].length);
    var inheritType = match[1] || match[3];
    var optional = match[2] === '?';

    //If only parents then start at the parent element
    if ( inheritType === '^^' ) {
      $element = $element.parent() as ng.IAugmentedJQuery;
    }

    if (!value) {
      var dataName = `$${ name }Controller`;
      value = inheritType ? $element.inheritedData(dataName) : $element.data(dataName);
    }

    if (!value && !optional) {
      throw new Error(
        `Directive/Controller '${name}', required by directive '${getFuncName(directive)}', can't be found!`);
    }
  } else if ( isArray( require ) ) {
    value = [];
    for ( var i = 0, ii = (require as string[]).length; i < ii; i++ ) {
      value[ i ] = getRequiredControllers( require[ i ], $element, directive );
    }
  } else if ( isJsObject( require ) ) {
    value = {};
    StringMapWrapper.forEach( require, function ( controller, property ) {
      value[ property ] = getRequiredControllers( controller, $element, directive );
    } );
  }

  return value || null;
}


export function getEmptyRequiredControllers( requireMap: {[key:string]:string} ): {[key:string]:void} {

  return StringMapWrapper.keys( requireMap ).reduce( ( acc, keyName: string )=>{
    acc[ keyName ] = undefined;
    return acc;
  }, {} );
}

export function createNewInjectablesToMatchLocalDi(
  originalInjectables: string[],
  requireMap: {[key:string]:string}
): string[] {

  const requireKeys = StringMapWrapper.keys( requireMap );

  return originalInjectables.slice()
    .map( injectable => {
      const [replaceInjName] = requireKeys
        .filter( keyName => StringWrapper.startsWith( keyName, injectable ) );

      // if found remove that key so we won't assign the same
      if(replaceInjName){
        const idx = requireKeys.indexOf(replaceInjName);
        requireKeys.splice(idx,1);
      }

      return replaceInjName || injectable;

    } );
}

/**
 * @deprecated
 * @TODO remove?
 */
function injectionArgs(fn, locals, serviceName, injects) {
  var args = [],
  // $inject = createInjector.$$annotate(fn, strictDi, serviceName);
    $inject = injects;

  for (var i = 0, length = $inject.length; i < length; i++) {
    var key = $inject[i];
    if (typeof key !== 'string') {
      throw new Error(`itkn, Incorrect injection token! Expected service name as string, got ${key}`);
    }
    /*    args.push( locals && locals.hasOwnProperty( key )
     ? locals[ key ]
     : getService( key, serviceName ) );*/
    args.push( locals[ key ] );
  }
  return args;
}
