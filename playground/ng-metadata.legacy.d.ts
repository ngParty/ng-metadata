// import Subject = require('rxjs/Subject');
declare type Observable<T> = any;
declare type Subject<T> = any;

declare module ngMetadataPlatform{

  // type AppRoot = string | Element | Document;
  // function bootstrap(ngModule: string, {element, strictDi}?: {
  //   element?: AppRoot;
  //   strictDi?: boolean;
  // }): void;

  function bootstrap(rootComponent: Type, providers: any[]): void;

  /**
   * A service that can be used to get and set the title of a current HTML document.
   *
   * Since an Angular 2 application can't be bootstrapped on the entire HTML document (`<html>` tag)
   * it is not possible to bind to the `text` property of the `HTMLTitleElement` elements
   * (representing the `<title>` tag). Instead, this service can be used to set and get the current
   * title value.
   */
  class Title {
      private $document;
      constructor($document: ng.IDocumentService);
      /**
       * Get the title of the current HTML document.
       * @returns {string}
       */
      getTitle(): string;
      /**
       * Set the title of the current HTML document.
       * @param newTitle
       */
      setTitle(newTitle: string): void;
  }


}
declare module ngMetadataCore{

  export interface Type extends Function {}

  export class OpaqueToken {
    private _desc;
    constructor(_desc: string);
    desc: string;
    toString(): string;
  }

  /**
   * A `changes` object whose keys are property names and
   * values are instances of {@link SimpleChange}. See {@link OnChanges}
   */
  export interface SimpleChanges {
    [propName: string]: SimpleChange;
  }
  /**
 * Represents a basic change from a previous to a new value.
 */
  export class SimpleChange {
    previousValue: any;
    currentValue: any;
    constructor(previousValue: any, currentValue: any);
    /**
     * Check whether the new value is the first value assigned.
     */
    isFirstChange(): boolean;
  }

  export class ChangeDetectorRef {
    private $scope;
    static create($scope: ng.IScope): ChangeDetectorRef;
    constructor($scope: ng.IScope);
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
    markForCheck(): void;
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
    detach(): void;
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
    detectChanges(): void;
    /**
     * Checks the change detector and its children, and throws if any changes are detected.
     *
     * This is used in development mode to verify that running change detection doesn't introduce
     * other changes.
     */
    checkNoChanges(): void;
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
    reattach(): void;
  }

  /**
 * Describes within the change detector which strategy will be used the next time change
 * detection is triggered.
 */
export const enum ChangeDetectionStrategy {
    /**
     * `CheckedOnce` means that after calling detectChanges the mode of the change detector
     * will become `Checked`.
     */
    /**
     * `Checked` means that the change detector should be skipped until its mode changes to
     * `CheckOnce`.
     */
    /**
     * `CheckAlways` means that after calling detectChanges the mode of the change detector
     * will remain `CheckAlways`.
     */
    /**
     * `Detached` means that the change detector sub tree is not a part of the main tree and
     * should be skipped.
     */
    /**
     * `OnPush` means that the change detector's mode will be set to `CheckOnce` during hydration.
     */
    OnPush = 0,
    /**
     * `Default` means that the change detector's mode will be set to `CheckAlways` during hydration.
     */
    Default = 1,
}

  export type ProviderType = Type | string | OpaqueToken;
  /**
   * should extract the string token from provided Type and add $inject angular 1 annotation to constructor if @Inject
   * was used
   * @param type
   * @returns {string}
   */
  export function provide(type: ProviderType, {useClass, useValue, useFactory, deps}?: {
    useClass?: Type,
    useValue?: any,
    useFactory?: Function,
    deps?: Object[]
  }): [string, Type];

  function Directive({selector, legacy}: {
    selector: string;
    legacy?: ng.IDirective;
    inputs?: string[],
    outputs?: string[],
    providers?: Function[],
  }): ClassDecorator;
  function Component({selector, template, templateUrl, inputs, attrs, outputs, legacy, changeDetection, directives, moduleId}: {
    selector: string;
    template?: string;
    templateUrl?: string;
    inputs?: string[];
    outputs?: string[];
    attrs?: string[];
    legacy?: ng.IDirective;
    changeDetection?: ChangeDetectionStrategy;
    directives?: Function[],
    providers?: Function[],
    viewProviders?: Function[],
    pipes?: Function[],
    moduleId?: string
  }): ClassDecorator;
  function Output(bindingPropertyName?: string): PropertyDecorator;
  function Input(bindingPropertyName?: string): PropertyDecorator;
  function Attr(bindingPropertyName?: string): PropertyDecorator;

  function Pipe({name, pure}?: {
    name?: string;
    pure?: boolean;
  }): ClassDecorator;

  export function Optional(): ParameterDecorator;
  export function Host(): ParameterDecorator;
  export function Parent(): ParameterDecorator;
  export function Self(): ParameterDecorator;
  export function SkipSelf(): ParameterDecorator;
  export function HostListener(eventName: string, args?: string[]): MethodDecorator;

  /**
   * Factory for {@link ContentChildren}.
   */
  export interface ContentChildrenFactory {
    (selector: Type | string, {descendants}?: {
      descendants?: boolean;
    }): any;
    new (selector: Type | string, {descendants}?: {
      descendants?: boolean;
    }): any;
  }
  /**
   * Factory for {@link ContentChild}.
   */
  export interface ContentChildFactory {
    (selector: Type | string): any;
    new (selector: Type | string): any;
  }
  /**
   * Factory for {@link ViewChildren}.
   */
  export interface ViewChildrenFactory {
    (selector: Type | string): any;
    new (selector: Type | string): any;
  }
  /**
   * Factory for {@link ViewChild}.
   */
  export interface ViewChildFactory {
    (selector: Type | string): any;
    new (selector: Type | string): ViewChildFactory;
  }

  export const ContentChildren: ContentChildrenFactory;
  export const ContentChild: ContentChildFactory;
  export const ViewChildren: ViewChildrenFactory;
  export const ViewChild: ViewChildFactory;

  interface InjectableServiceConfigStatic {
    _name?: string
  }
  /**
   * Injectable type used for @Inject(Injectable) decorator
   */
  type InjectableToken = string | Function | InjectableServiceConfigStatic;

  function Inject(injectable: InjectableToken): ParameterDecorator;

  function Injectable(name?: string): ClassDecorator;

  export interface ForwardRefFn {
    (): any;
    __forward_ref__?: Type;
    toString?(): string;
  }
  /**
   * Allows to refer to references which are not yet defined.
   *
   * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
   * DI is declared,
   * but not yet defined. It is also used when the `token` which we use when creating a query is not
   * yet defined.
   *
   * ### Example
   * {@example core/di/ts/forward_ref/forward_ref.ts region='forward_ref'}
   */
  export function forwardRef(forwardRefFn: ForwardRefFn): Type;

  export enum LifecycleHooks {
    OnInit = 0,
    OnDestroy = 1,
    AfterContentInit = 2,
    AfterContentChecked = 3,
    AfterViewInit = 4,
    AfterViewChecked = 5,
    OnChildrenChanged = 6,
  }
  /**
   * @internal
   */
  export var LIFECYCLE_HOOKS_VALUES: LifecycleHooks[];
  /**
 * Lifecycle hooks are guaranteed to be called in the following order:
 * - `OnChanges` (if any bindings have changed),
 * - `OnInit` (after the first check only),
 * - `AfterContentInit`,
 * - `AfterContentChecked`,
 * - `AfterViewInit`,
 * - `AfterViewChecked`,
 * - `OnDestroy` (at the very end before destruction)
 */
/**
 * Implement this interface to get notified when any data-bound property of your directive changes.
 *
 * `ngOnChanges` is called right after the data-bound properties have been checked and before view
 * and content children are checked if at least one of them has changed.
 *
 * The `changes` parameter contains an entry for each of the changed data-bound property. The key is
 * the property name and the value is an instance of {@link SimpleChange}.
 *
 * ### Example ([live example](http://plnkr.co/edit/AHrB6opLqHDBPkt4KpdT?p=preview)):
 *
 * ```typescript
 * @Component({
 *   selector: 'my-cmp',
 *   template: `<p>myProp = {{myProp}}</p>`
 * })
 * class MyComponent implements OnChanges {
 *   @Input() myProp: any;
 *
 *   ngOnChanges(changes: {[propName: string]: SimpleChange}) {
 *     console.log('ngOnChanges - myProp = ' + changes['myProp'].currentValue);
 *   }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `
 *     <button (click)="value = value + 1">Change MyComponent</button>
 *     <my-cmp [my-prop]="value"></my-cmp>`,
 *   directives: [MyComponent]
 * })
 * export class App {
 *   value = 0;
 * }
 *
 * bootstrap(App).catch(err => console.error(err));
 * ```
 */
export interface OnChanges {
  ngOnChanges(changes: SimpleChanges): any;
}
  /**
   * Implement this interface to execute custom initialization logic after your directive's
   * data-bound properties have been initialized.
   *
   * `ngOnInit` is called right after the directive's data-bound properties have been checked for the
   * first time, and before any of its children have been checked. It is invoked only once when the
   * directive is instantiated.
   *
   * ### Example ([live example](http://plnkr.co/edit/1MBypRryXd64v4pV03Yn?p=preview))
   *
   * ```typescript
   * @Component({
 *   selector: 'my-cmp',
 *   template: `<p>my-component</p>`
 * })
   * class MyComponent implements OnInit, OnDestroy {
 *   ngOnInit() {
 *     console.log('ngOnInit');
 *   }
 *
 *   ngOnDestroy() {
 *     console.log('ngOnDestroy');
 *   }
 * }
   *
   * @Component({
 *   selector: 'app',
 *   template: `
 *     <button (click)="hasChild = !hasChild">
 *       {{hasChild ? 'Destroy' : 'Create'}} MyComponent
 *     </button>
 *     <my-cmp *ngIf="hasChild"></my-cmp>`,
 *   directives: [MyComponent, NgIf]
 * })
   * export class App {
 *   hasChild = true;
 * }
   *
   * bootstrap(App).catch(err => console.error(err));
   *  ```
   */
  export interface OnInit {
    ngOnInit(): any;
  }
  /**
 * Implement this interface to override the default change detection algorithm for your directive.
 *
 * `ngDoCheck` gets called to check the changes in the directives instead of the default algorithm.
 *
 * The default change detection algorithm looks for differences by comparing bound-property values
 * by reference across change detection runs. When `DoCheck` is implemented, the default algorithm
 * is disabled and `ngDoCheck` is responsible for checking for changes.
 *
 * Implementing this interface allows improving performance by using insights about the component,
 * its implementation and data types of its properties.
 *
 * Note that a directive should not implement both `DoCheck` and {@link OnChanges} at the same time.
 * `ngOnChanges` would not be called when a directive implements `DoCheck`. Reaction to the changes
 * have to be handled from within the `ngDoCheck` callback.
 *
 * Use {@link KeyValueDiffers} and {@link IterableDiffers} to add your custom check mechanisms.
 *
 * ### Example ([live demo](http://plnkr.co/edit/QpnIlF0CR2i5bcYbHEUJ?p=preview))
 *
 * In the following example `ngDoCheck` uses an {@link IterableDiffers} to detect the updates to the
 * array `list`:
 *
 * ```typescript
 * @Component({
 *   selector: 'custom-check',
 *   template: `
 *     <p>Changes:</p>
 *     <ul>
 *       <li *ngFor="let line of logs">{{line}}</li>
 *     </ul>`,
 *   directives: [NgFor]
 * })
 * class CustomCheckComponent implements DoCheck {
 *   @Input() list: any[];
 *   differ: any;
 *   logs = [];
 *
 *   constructor(differs: IterableDiffers) {
 *     this.differ = differs.find([]).create(null);
 *   }
 *
 *   ngDoCheck() {
 *     var changes = this.differ.diff(this.list);
 *
 *     if (changes) {
 *       changes.forEachAddedItem(r => this.logs.push('added ' + r.item));
 *       changes.forEachRemovedItem(r => this.logs.push('removed ' + r.item))
 *     }
 *   }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `
 *     <button (click)="list.push(list.length)">Push</button>
 *     <button (click)="list.pop()">Pop</button>
 *     <custom-check [list]="list"></custom-check>`,
 *   directives: [CustomCheckComponent]
 * })
 * export class App {
 *   list = [];
 * }
 * ```
 */
export interface DoCheck {
    ngDoCheck(): any;
}
  /**
   * Implement this interface to get notified when your directive is destroyed.
   *
   * `ngOnDestroy` callback is typically used for any custom cleanup that needs to occur when the
   * instance is destroyed
   *
   * ### Example ([live example](http://plnkr.co/edit/1MBypRryXd64v4pV03Yn?p=preview))
   *
   * ```typesript
   * @Component({
 *   selector: 'my-cmp',
 *   template: `<p>my-component</p>`
 * })
   * class MyComponent implements OnInit, OnDestroy {
 *   ngOnInit() {
 *     console.log('ngOnInit');
 *   }
 *
 *   ngOnDestroy() {
 *     console.log('ngOnDestroy');
 *   }
 * }
   *
   * @Component({
 *   selector: 'app',
 *   template: `
 *     <button (click)="hasChild = !hasChild">
 *       {{hasChild ? 'Destroy' : 'Create'}} MyComponent
 *     </button>
 *     <my-cmp *ngIf="hasChild"></my-cmp>`,
 *   directives: [MyComponent, NgIf]
 * })
   * export class App {
 *   hasChild = true;
 * }
   *
   * bootstrap(App).catch(err => console.error(err));
   * ```
   *
   *
   * To create a stateful Pipe, you should implement this interface and set the `pure`
   * parameter to `false` in the {@link PipeMetadata}.
   *
   * A stateful pipe may produce different output, given the same input. It is
   * likely that a stateful pipe may contain state that should be cleaned up when
   * a binding is destroyed. For example, a subscription to a stream of data may need to
   * be disposed, or an interval may need to be cleared.
   *
   * ### Example ([live demo](http://plnkr.co/edit/i8pm5brO4sPaLxBx56MR?p=preview))
   *
   * In this example, a pipe is created to countdown its input value, updating it every
   * 50ms. Because it maintains an internal interval, it automatically clears
   * the interval when the binding is destroyed or the countdown completes.
   *
   * ```
   * import {OnDestroy, Pipe, PipeTransform} from 'angular2/core'
   * @Pipe({name: 'countdown', pure: false})
   * class CountDown implements PipeTransform, OnDestroy {
 *   remainingTime:Number;
 *   interval:SetInterval;
 *   ngOnDestroy() {
 *     if (this.interval) {
 *       clearInterval(this.interval);
 *     }
 *   }
 *   transform(value: any, args: any[] = []) {
 *     if (!parseInt(value, 10)) return null;
 *     if (typeof this.remainingTime !== 'number') {
 *       this.remainingTime = parseInt(value, 10);
 *     }
 *     if (!this.interval) {
 *       this.interval = setInterval(() => {
 *         this.remainingTime-=50;
 *         if (this.remainingTime <= 0) {
 *           this.remainingTime = 0;
 *           clearInterval(this.interval);
 *           delete this.interval;
 *         }
 *       }, 50);
 *     }
 *     return this.remainingTime;
 *   }
 * }
   * ```
   *
   * Invoking `{{ 10000 | countdown }}` would cause the value to be decremented by 50,
   * every 50ms, until it reaches 0.
   *
   */
  export interface OnDestroy {
    ngOnDestroy(): any;
  }
  /**
   * Implement this interface to get notified when your directive's content has been fully
   * initialized.
   *
   * ### Example ([live demo](http://plnkr.co/edit/plamXUpsLQbIXpViZhUO?p=preview))
   *
   * ```typescript
   * @Component({
 *   selector: 'child-cmp',
 *   template: `{{where}} child`
 * })
   * class ChildComponent {
   *   @Input() where: string;
   * }
   *
   * @Component({
 *   selector: 'parent-cmp',
 *   template: `<ng-content></ng-content>`
 * })
   * class ParentComponent implements AfterContentInit {
   *   @ContentChild(ChildComponent) contentChild: ChildComponent;
   *
   *   constructor() {
 *     // contentChild is not initialized yet
 *     console.log(this.getMessage(this.contentChild));
 *   }
   *
   *   ngAfterContentInit() {
 *     // contentChild is updated after the content has been checked
 *     console.log('AfterContentInit: ' + this.getMessage(this.contentChild));
 *   }
   *
   *   private getMessage(cmp: ChildComponent): string {
 *     return cmp ? cmp.where + ' child' : 'no child';
 *   }
   * }
   *
   * @Component({
 *   selector: 'app',
 *   template: `
 *     <parent-cmp>
 *       <child-cmp where="content"></child-cmp>
 *     </parent-cmp>`,
 *   directives: [ParentComponent, ChildComponent]
 * })
   * export class App {
 * }
   *
   * bootstrap(App).catch(err => console.error(err));
   * ```
   */
  export interface AfterContentInit {
    ngAfterContentInit(): any;
  }
  /**
   * Implement this interface to get notified after every check of your directive's content.
   *
   * ### Example ([live demo](http://plnkr.co/edit/tGdrytNEKQnecIPkD7NU?p=preview))
   *
   * ```typescript
   * @Component({selector: 'child-cmp', template: `{{where}} child`})
   * class ChildComponent {
   *   @Input() where: string;
   * }
   *
   * @Component({selector: 'parent-cmp', template: `<ng-content></ng-content>`})
   * class ParentComponent implements AfterContentChecked {
   *   @ContentChild(ChildComponent) contentChild: ChildComponent;
   *
   *   constructor() {
 *     // contentChild is not initialized yet
 *     console.log(this.getMessage(this.contentChild));
 *   }
   *
   *   ngAfterContentChecked() {
 *     // contentChild is updated after the content has been checked
 *     console.log('AfterContentChecked: ' + this.getMessage(this.contentChild));
 *   }
   *
   *   private getMessage(cmp: ChildComponent): string {
 *     return cmp ? cmp.where + ' child' : 'no child';
 *   }
   * }
   *
   * @Component({
 *   selector: 'app',
 *   template: `
 *     <parent-cmp>
 *       <button (click)="hasContent = !hasContent">Toggle content child</button>
 *       <child-cmp *ngIf="hasContent" where="content"></child-cmp>
 *     </parent-cmp>`,
 *   directives: [NgIf, ParentComponent, ChildComponent]
 * })
   * export class App {
 *   hasContent = true;
 * }
   *
   * bootstrap(App).catch(err => console.error(err));
   * ```
   */
  export interface AfterContentChecked {
    ngAfterContentChecked(): any;
  }
  /**
   * Implement this interface to get notified when your component's view has been fully initialized.
   *
   * ### Example ([live demo](http://plnkr.co/edit/LhTKVMEM0fkJgyp4CI1W?p=preview))
   *
   * ```typescript
   * @Component({selector: 'child-cmp', template: `{{where}} child`})
   * class ChildComponent {
   *   @Input() where: string;
   * }
   *
   * @Component({
 *   selector: 'parent-cmp',
 *   template: `<child-cmp where="view"></child-cmp>`,
 *   directives: [ChildComponent]
 * })
   * class ParentComponent implements AfterViewInit {
   *   @ViewChild(ChildComponent) viewChild: ChildComponent;
   *
   *   constructor() {
 *     // viewChild is not initialized yet
 *     console.log(this.getMessage(this.viewChild));
 *   }
   *
   *   ngAfterViewInit() {
 *     // viewChild is updated after the view has been initialized
 *     console.log('ngAfterViewInit: ' + this.getMessage(this.viewChild));
 *   }
   *
   *   private getMessage(cmp: ChildComponent): string {
 *     return cmp ? cmp.where + ' child' : 'no child';
 *   }
   * }
   *
   * @Component({
 *   selector: 'app',
 *   template: `<parent-cmp></parent-cmp>`,
 *   directives: [ParentComponent]
 * })
   * export class App {
 * }
   *
   * bootstrap(App).catch(err => console.error(err));
   * ```
   */
  export interface AfterViewInit {
    ngAfterViewInit(): any;
  }
  /**
   * Implement this interface to get notified after every check of your component's view.
   *
   * ### Example ([live demo](http://plnkr.co/edit/0qDGHcPQkc25CXhTNzKU?p=preview))
   *
   * ```typescript
   * @Component({selector: 'child-cmp', template: `{{where}} child`})
   * class ChildComponent {
   *   @Input() where: string;
   * }
   *
   * @Component({
 *   selector: 'parent-cmp',
 *   template: `
 *     <button (click)="showView = !showView">Toggle view child</button>
 *     <child-cmp *ngIf="showView" where="view"></child-cmp>`,
 *   directives: [NgIf, ChildComponent]
 * })
   * class ParentComponent implements AfterViewChecked {
   *   @ViewChild(ChildComponent) viewChild: ChildComponent;
   *   showView = true;
   *
   *   constructor() {
 *     // viewChild is not initialized yet
 *     console.log(this.getMessage(this.viewChild));
 *   }
   *
   *   ngAfterViewChecked() {
 *     // viewChild is updated after the view has been checked
 *     console.log('AfterViewChecked: ' + this.getMessage(this.viewChild));
 *   }
   *
   *   private getMessage(cmp: ChildComponent): string {
 *     return cmp ? cmp.where + ' child' : 'no child';
 *   }
   * }
   *
   * @Component({
 *   selector: 'app',
 *   template: `<parent-cmp></parent-cmp>`,
 *   directives: [ParentComponent]
 * })
   * export class App {
 * }
   *
   * bootstrap(App).catch(err => console.error(err));
   * ```
   */
  export interface AfterViewChecked {
    ngAfterViewChecked(): any;
  }
  /**
   * this is a private interface which method is called from within postLink Fn or
   * from children which are queryied via one of `@Query*` decorators
   * @private
   */
  export interface OnChildrenChanged {
    _ngOnChildrenChanged?(): any;
  }

  export interface OnChanges {
    ngOnChanges(changes: {[key: string]: {
      previousValue: any,
      currentValue: any,
      isFirstChange(): boolean
    }});
  }

  /**
   * Disable Angular's development mode, which turns off assertions and other
   * checks within the framework.
   *
   * One important assertion this disables verifies that a change detection pass
   * does not result in additional changes to any bindings (also known as
   * unidirectional data flow).
   */
  export function enableProdMode(): void;

  export class EventEmitter<T> {
    private __isAsync;
    /** @internal */
    private _ngExpressionBindingCb;
    /**
     * Creates an instance of [EventEmitter], which depending on [isAsync],
     * delivers events synchronously or asynchronously.
     */
    constructor(isAsync?: boolean);
    /** @internal */
    wrapNgExpBindingToEmitter(cb: Function): void;
    emit(value: T): void;
    subscribe(generatorOrNext?: any, error?: any, complete?: any): {unsubscribe():void};
  }

  export interface EventHandler<T> {
    ($event: T):void;
  }
}

declare module ngMetadataCommon {
  export const CORE_DIRECTIVES: Type[]
  export abstract class NgModel implements ng.INgModelController {
    $viewValue: any;
    $modelValue: any;
    $parsers: ng.IModelParser[];
    $formatters: ng.IModelFormatter[];
    $viewChangeListeners: ng.IModelViewChangeListener[];
    $error: any;
    $name: string;
    $touched: boolean;
    $untouched: boolean;
    $validators: ng.IModelValidators;
    $asyncValidators: ng.IAsyncModelValidators;
    $pending: any;
    $pristine: boolean;
    $dirty: boolean;
    $valid: boolean;
    $invalid: boolean;
    $render(): void;
    $setValidity(validationErrorKey: string, isValid: boolean): void;
    $setViewValue(value: any, trigger?: string): void;
    $setPristine(): void;
    $setDirty(): void;
    $validate(): void;
    $setTouched(): void;
    $setUntouched(): void;
    $rollbackViewValue(): void;
    $commitViewValue(): void;
    $isEmpty(value: any): boolean;
  }
  export abstract class NgForm implements ng.IFormController {
    $pristine: boolean;
    $dirty: boolean;
    $valid: boolean;
    $invalid: boolean;
    $submitted: boolean;
    $error: any;
    $pending: any;
    $addControl(control: angular.INgModelController): void;
    $removeControl(control: angular.INgModelController): void;
    $setValidity(validationErrorKey: string, isValid: boolean, control: angular.INgModelController): void;
    $setDirty(): void;
    $setPristine(): void;
    $commitViewValue(): void;
    $rollbackViewValue(): void;
    $setSubmitted(): void;
    $setUntouched(): void;
  }
  export abstract class NgSelect {
    ngModelCtrl: ng.INgModelController;
    unknownOption: ng.IAugmentedJQuery;
    renderUnknownOption(val: string): void;
    removeUnknownOption(): void;
    abstract readValue(): string;
    writeValue(value: string): void;
    addOption(value: string, element: ng.IAugmentedJQuery): void;
    removeOption(value: any): void;
    abstract hasOption(value: any): boolean;
    registerOption(optionScope: ng.IScope, optionElement: ng.IAugmentedJQuery, optionAttrs: ng.IAttributes, interpolateValueFn?: Function, interpolateTextFn?: Function): void;
  }

  export class AsyncPipe {
    private static nextObjectID;
    private static values;
    private static subscriptions;
    private static TRACK_PROP_NAME;
    private static objectId(obj);
    private static isPromiseOrObservable(obj);
    private static getSubscriptionStrategy(input);
    private static dispose(inputId);
    transform(input: Observable<any> | ng.IPromise<any> | ng.IHttpPromise<any>, scope?: ng.IScope): any;
  }
}
declare module "ng-metadata/core" {
  export = ngMetadataCore;
}
declare module "ng-metadata/platform-browser-dynamic" {
  export = ngMetadataPlatform;
}

declare module "ng-metadata/common" {
  export = ngMetadataCommon
}
declare type Type = Function;
declare type ProvideSpreadType = string|Type;

declare module angular {
  interface IModule {
    // constant(object: Object): IModule;
    // value(object: Object): IModule;
    directive(...args: ProvideSpreadType[]): IModule;
    filter(...args: ProvideSpreadType[]): IModule;
    service(...args: ProvideSpreadType[]): IModule;
  }
}
