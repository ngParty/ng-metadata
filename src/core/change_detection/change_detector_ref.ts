import { Injectable } from '../di/decorators';

@Injectable( 'changeDetectorRef' )
export class ChangeDetectorRef {

  static create( $scope: ng.IScope ): ChangeDetectorRef {
    return new ChangeDetectorRef( $scope );
  }

  constructor( private $scope: ng.IScope ) {}

  /**
   * Marks all {@link ChangeDetectionStrategy#OnPush} ancestors as to be checked.
   *
   * <!-- TODO: Add a link to a chapter on OnPush components -->
   *
   * ### Example ([live demo](http://plnkr.co/edit/GC512b?p=preview))
   *
   * ```typescript
   * @Component({
   *   selector: 'cmp',
   *   changeDetection: ChangeDetectionStrategy.OnPush,
   *   template: `Number of ticks: {{numberOfTicks}}`
   * })
   * class Cmp {
   *   numberOfTicks = 0;
   *
   *   constructor(ref: ChangeDetectorRef) {
   *     setInterval(() => {
   *       this.numberOfTicks ++
   *       // the following is required, otherwise the view will not be updated
   *       this.ref.markForCheck();
   *     }, 1000);
   *   }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   changeDetection: ChangeDetectionStrategy.OnPush,
   *   template: `
   *     <cmp><cmp>
   *   `,
   *   directives: [Cmp]
   * })
   * class App {
   * }
   *
   * bootstrap(App);
   * ```
   */
  markForCheck(): void { this.$scope.$applyAsync() }

  /**
   * Detaches the change detector from the change detector tree.
   *
   * The detached change detector will not be checked until it is reattached.
   *
   * This can also be used in combination with {@link ChangeDetectorRef#detectChanges} to implement
   * local change
   * detection checks.
   *
   * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
   * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
   *
   * ### Example
   *
   * The following example defines a component with a large list of readonly data.
   * Imagine the data changes constantly, many times per second. For performance reasons,
   * we want to check and update the list every five seconds. We can do that by detaching
   * the component's change detector and doing a local check every five seconds.
   *
   * ```typescript
   * class DataProvider {
   *   // in a real application the returned data will be different every time
   *   get data() {
   *     return [1,2,3,4,5];
   *   }
   * }
   *
   * @Component({
   *   selector: 'giant-list',
   *   template: `
   *     <li *ngFor="let d of dataProvider.data">Data {{d}}</lig>
   *   `,
   *   directives: [NgFor]
   * })
   * class GiantList {
   *   constructor(private ref: ChangeDetectorRef, private dataProvider:DataProvider) {
   *     ref.detach();
   *     setInterval(() => {
   *       this.ref.detectChanges();
   *     }, 5000);
   *   }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   providers: [DataProvider],
   *   template: `
   *     <giant-list><giant-list>
   *   `,
   *   directives: [GiantList]
   * })
   * class App {
   * }
   *
   * bootstrap(App);
   * ```
   */
  detach(): void { disconnectScope( this.$scope ) }

  /**
   * Checks the change detector and its children.
   *
   * This can also be used in combination with {@link ChangeDetectorRef#detach} to implement local
   * change detection
   * checks.
   *
   * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
   * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
   *
   * ### Example
   *
   * The following example defines a component with a large list of readonly data.
   * Imagine, the data changes constantly, many times per second. For performance reasons,
   * we want to check and update the list every five seconds.
   *
   * We can do that by detaching the component's change detector and doing a local change detection
   * check
   * every five seconds.
   *
   * See {@link ChangeDetectorRef#detach} for more information.
   */
  detectChanges(): void { this.$scope.$digest() }

  /**
   * Checks the change detector and its children, and throws if any changes are detected.
   *
   * This is used in development mode to verify that running change detection doesn't introduce
   * other changes.
   */
  checkNoChanges(): void {}

  /**
   * Reattach the change detector to the change detector tree.
   *
   * This also marks OnPush ancestors as to be checked. This reattached change detector will be
   * checked during the next change detection run.
   *
   * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
   *
   * ### Example ([live demo](http://plnkr.co/edit/aUhZha?p=preview))
   *
   * The following example creates a component displaying `live` data. The component will detach
   * its change detector from the main change detector tree when the component's live property
   * is set to false.
   *
   * ```typescript
   * class DataProvider {
   *   data = 1;
   *
   *   constructor() {
   *     setInterval(() => {
   *       this.data = this.data * 2;
   *     }, 500);
   *   }
   * }
   *
   * @Component({
   *   selector: 'live-data',
   *   inputs: ['live'],
   *   template: `Data: {{dataProvider.data}}`
   * })
   * class LiveData {
   *   constructor(private ref: ChangeDetectorRef, private dataProvider:DataProvider) {}
   *
   *   set live(value) {
   *     if (value)
   *       this.ref.reattach();
   *     else
   *       this.ref.detach();
   *   }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   providers: [DataProvider],
   *   template: `
   *     Live Update: <input type="checkbox" [(ngModel)]="live">
   *     <live-data [live]="live"><live-data>
   *   `,
   *   directives: [LiveData, FORM_DIRECTIVES]
   * })
   * class App {
   *   live = true;
   * }
   *
   * bootstrap(App);
   * ```
   */
  reattach(): void { reconnectScope( this.$scope ) }
}


// Stop watchers and events from firing on a scope without destroying it,
// by disconnecting it from its parent and its siblings' linked lists.
function disconnectScope( scope: ng.IScope ) {

  if ( !scope ) return;

  // we can't destroy the root scope or a scope that has been already destroyed
  if ( scope.$root === scope ) return;
  if ( scope.$$destroyed ) return;

  const parent = scope.$parent;
  scope.$$disconnected = true;

  // See Scope.$destroy
  if ( parent.$$childHead === scope ) parent.$$childHead = scope.$$nextSibling;
  if ( parent.$$childTail === scope ) parent.$$childTail = scope.$$prevSibling;
  if ( scope.$$prevSibling ) scope.$$prevSibling.$$nextSibling = scope.$$nextSibling;
  if ( scope.$$nextSibling ) scope.$$nextSibling.$$prevSibling = scope.$$prevSibling;

  scope.$$nextSibling = scope.$$prevSibling = null;

}

// Undo the effects of disconnectScope above.
function reconnectScope( scope: ng.IScope ) {
  if ( !scope ) return;

  // we can't disconnect the root node or scope already disconnected
  if ( scope.$root === scope ) return;
  if ( !scope.$$disconnected ) return;

  const child = scope;
  const parent = child.$parent;

  child.$$disconnected = false;
  // See Scope.$new for this logic...
  child.$$prevSibling = parent.$$childTail;
  if ( parent.$$childHead ) {
    parent.$$childTail.$$nextSibling = child;
    parent.$$childTail = child;
  } else {
    parent.$$childHead = parent.$$childTail = child;
  }

}
