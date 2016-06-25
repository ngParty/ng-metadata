import { DirectiveMetadata, ComponentMetadata } from './metadata_directives';

/**
 * use #isDirective instead
 * @deprecated
 */
export function isAttrDirective( metadata: any ): metadata is DirectiveMetadata {
  return metadata instanceof DirectiveMetadata && !(metadata instanceof ComponentMetadata);
}
/**
 * use #isComponent instead
 * @deprecated
 */
export function isComponentDirective( metadata: any ): metadata is ComponentMetadata{
  return metadata instanceof ComponentMetadata;
}

/**
 *
 * @param scope
 * @param element
 * @param ctrl
 * @param implementsNgOnDestroy
 * @param watchersToDispose
 * @param observersToDispose
 * @private
 */
export function _setupDestroyHandler(
  scope: ng.IScope,
  element: ng.IAugmentedJQuery,
  ctrl: any,
  implementsNgOnDestroy: boolean,
  watchersToDispose: Function[] = [],
  observersToDispose: Function[] = []
): void {

  scope.$on( '$destroy', ()=> {

    if ( implementsNgOnDestroy ) { ctrl.ngOnDestroy() }

    watchersToDispose.forEach( _watcherDispose=>_watcherDispose() );
    observersToDispose.forEach( _observerDispose=>_observerDispose() );
    element.off();
  } );
}
