import { ComponentMetadata, DirectiveMetadata } from '../metadata_directives';

import { isComponentDirective } from '../directives_utils';

import { SimpleChange, ChangeDetectionUtil } from '../../change_detection/change_detection_util';
import { changesQueueService } from '../../change_detection/changes_queue';

import { StringMapWrapper } from '../../../facade/collections';
import { global, noop, isString, isBoolean, isFunction } from '../../../facade/lang';
import { EventEmitter } from '../../../facade/async';

import { BINDING_MODE } from './constants';
import { setupFields, SetupAttrField } from './binding_parser';

/**
 * Create Bindings manually for both Directive/Component
 * @returns {{watchers: Array, observers: Array}}
 * @internal
 * @private
 */
export function _createDirectiveBindings(
  hasIsolateScope: boolean,
  ngScope: ng.IScope,
  ngAttrs: ng.IAttributes,
  ctrl: any,
  metadata: ComponentMetadata|DirectiveMetadata,
  { $interpolate, $parse, $rootScope }: {
    $interpolate?: ng.IInterpolateService,
    $parse?: ng.IParseService,
    $rootScope?: ng.IRootScopeService
  }
): {
  initialChanges: {[key: string]: SimpleChange},
  removeWatches: Function,
  _watchers: {watchers: Function[], observers: Function[]}
} {

  /*  let BOOLEAN_ATTR = {};
   'multiple,selected,checked,disabled,readOnly,required,open'
   .split(',')
   .forEach(function(value) {
   BOOLEAN_ATTR[value.toLocaleLowerCase()] = value;
   });*/

  const isBindingImmutable = isComponentDirective( metadata ) && ChangeDetectionUtil.isOnPushChangeDetectionStrategy( metadata.changeDetection );
  const scope = hasIsolateScope
    ? ngScope.$parent
    : ngScope;
  const { inputs=[], outputs=[] } = metadata;
  const parsedBindings = setupFields( ngAttrs, inputs, outputs );

  const _internalWatchers = [];
  const _internalObservers = [];

  // onChanges tmp vars
  const initialChanges = {} as {[key: string]: SimpleChange};
  let changes;

  // this will create flush queue internally only once
  // we need to call this here because we need $rootScope service
  changesQueueService.buildFlushOnChanges( $rootScope );

  // setup @Inputs '<' or '='
  StringMapWrapper.forEach( parsedBindings.inputs as any, ( config: SetupAttrField, propName: string ) => {

    const { exp, attrName, mode } = config;
    // support for TWO_WAY only for components
    const hasTwoWayBinding = hasIsolateScope && mode === BINDING_MODE.twoWay;

    const removeWatch = hasTwoWayBinding
      ? _createTwoWayBinding( propName, attrName, exp )
      : _createOneWayBinding( propName, attrName, exp, isBindingImmutable );
    _internalWatchers.push( removeWatch );

  } );

  // setup @Input('@')
  StringMapWrapper.forEach( parsedBindings.attrs as any, ( config: SetupAttrField, propName: string ) => {

    const { attrName, exp, mode } = config;

    const removeObserver = _createAttrBinding( propName, attrName, exp );
    _internalObservers.push( removeObserver );

  } );

  // setup @Outputs
  StringMapWrapper.forEach( parsedBindings.outputs as any, ( config: SetupAttrField, propName: string ) => {

    const { exp, attrName, mode } = config;

    _createOutputBinding( propName, attrName, exp );

  } );

  function _createOneWayBinding( propName: string, attrName: string, exp: string, isImmutable: boolean = false ): Function {

    if ( !exp ) return;

    const parentGet = $parse( exp );
    const initialValue = ctrl[propName] = parentGet(scope);

    initialChanges[ propName ] = ChangeDetectionUtil.simpleChange( ChangeDetectionUtil.uninitialized, ctrl[ propName ] );

    return scope.$watch( parentGet, function parentValueWatchAction( newValue, oldValue ) {
      // https://github.com/angular/angular.js/commit/d9448dcb9f901ceb04deda1d5f3d5aac8442a718
      // https://github.com/angular/angular.js/commit/304796471292f9805b9cf77e51aacc9cfbb09921
      if ( oldValue === newValue ) {
        if ( oldValue === initialValue ) return;
        oldValue = initialValue;
      }
      recordChanges( propName, newValue, oldValue );
      ctrl[ propName ] = isImmutable ? angular.copy(newValue) : newValue;
    }, parentGet.literal );

  }
  function _createTwoWayBinding( propName: string, attrName: string, exp: string ): Function {

    if ( !exp ) return;

    let lastValue: any;
    const parentGet = $parse( exp );
    const parentSet = parentGet.assign || function () {
        // reset the change, or we will throw this exception on every $digest
        lastValue = ctrl[ propName ] = parentGet( scope );
        throw new Error(
          `nonassign,
          Expression '${ngAttrs[ attrName ]}' in attribute '${attrName}' used with directive '{2}' is non-assignable!`
        );
      };
    const compare: Function = parentGet.literal ? global.angular.equals : simpleCompare;
    const parentValueWatch = function parentValueWatch(parentValue) {
      if (!compare(parentValue, ctrl[propName])) {
        // we are out of sync and need to copy
        if (!compare(parentValue, lastValue)) {
          // parent changed and it has precedence
          ctrl[propName] = parentValue;
        } else {
          // if the parent can be assigned then do so
          parentSet(scope, parentValue = ctrl[propName]);
        }
      }
      return lastValue = parentValue;
    };
    (parentValueWatch as any).$stateful = true;

    lastValue = ctrl[propName] = parentGet(scope);
    // NOTE: we don't support collection watch, it's not good for performance
    // if (definition.collection) {
    //   removeWatch = scope.$watchCollection(attributes[attrName], parentValueWatch);
    // } else {
    //   removeWatch = scope.$watch($parse(attributes[attrName], parentValueWatch), null, parentGet.literal);
    // }
    // removeWatchCollection.push(removeWatch);
    return scope.$watch(
      // $parse( ngAttrs[ attrName ], parentValueWatch ),
      $parse( exp, parentValueWatch ),
      null,
      parentGet.literal
    );

    function simpleCompare(a, b) { return a === b || (a !== a && b !== b); }

  }
  function _createOutputBinding( propName: string, attrName: string, exp: string ): void {

    // Don't assign Object.prototype method to scope
    const parentGet: Function = exp
      ? $parse( exp )
      : noop;

    // Don't assign noop to ctrl if expression is not valid
    if ( parentGet === noop ) return;

    // here we assign property to EventEmitter instance directly
    const emitter = new EventEmitter<any>();
    emitter.wrapNgExpBindingToEmitter( function _exprBindingCb( locals ) {
      return parentGet( scope, locals );
    } );

    ctrl[propName] = emitter;

  }
  function _createAttrBinding( propName: string, attrName: string, exp: string ): Function {

    let lastValue = exp;

    // register watchers for further changes
    // The observer function will be invoked once during the next $digest following compilation.
    // The observer is then invoked whenever the interpolated value changes.

    const _disposeObserver = ngAttrs.$observe( attrName, function ( value: string|boolean ) {
      // https://github.com/angular/angular.js/commit/499e1b2adf27f32d671123f8dceadb3df2ad84a9
      if ( isString( value ) || isBoolean( value ) ) {
        const oldValue = ctrl[ propName ];
        recordChanges( propName, value, oldValue );
        ctrl[ propName ] = value;
      }
    } );

    (ngAttrs as any).$$observers[ attrName ].$$scope = scope;

    if ( isString( lastValue ) ) {
      // If the attribute has been provided then we trigger an interpolation to ensure
      // the value is there for use in the link fn
      ctrl[ propName ] = $interpolate( lastValue )( scope );
    } else if ( isBoolean( lastValue ) ) {
      // If the attributes is one of the BOOLEAN_ATTR then Angular will have converted
      // the value to boolean rather than a string, so we special case this situation
      ctrl[ propName ] = lastValue;
    }

    initialChanges[ propName ] = ChangeDetectionUtil.simpleChange( ChangeDetectionUtil.uninitialized, ctrl[ propName ] );
    return _disposeObserver;

  }

  function recordChanges<T>( key: string, currentValue: T, previousValue: T ): void {
    if (isFunction(ctrl.ngOnChanges) && currentValue !== previousValue) {
      // If we have not already scheduled the top level onChangesQueue handler then do so now
      if (!changesQueueService.onChangesQueue) {
        scope.$$postDigest(changesQueueService.flushOnChangesQueue);
        changesQueueService.onChangesQueue = [];
      }
      // If we have not already queued a trigger of onChanges for this controller then do so now
      if (!changes) {
        changes = {};
        changesQueueService.onChangesQueue.push(triggerOnChangesHook);
      }
      // If the has been a change on this property already then we need to reuse the previous value
      if (changes[key]) {
        previousValue = changes[key].previousValue;
      }
      // Store this change
      changes[key] = ChangeDetectionUtil.simpleChange(previousValue, currentValue);
    }
  }

  function triggerOnChangesHook(): void {
    ctrl.ngOnChanges( changes );
    // Now clear the changes so that we schedule onChanges when more changes arrive
    changes = undefined;
  }

  function removeWatches(): void {
    const removeWatchCollection = [ ..._internalWatchers, ..._internalObservers ];
    for ( let i = 0, ii = removeWatchCollection.length; i < ii; ++i ) {
      if (removeWatchCollection[ i ] && isFunction(removeWatchCollection[ i ])) {
        removeWatchCollection[ i ]();
      }
    }
  }

  return {
    initialChanges,
    removeWatches,
    _watchers: { watchers: _internalWatchers, observers: _internalObservers }
  };

}
