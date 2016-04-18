declare module ngMetadataPlatform{

  type AppRoot = string | Element | Document;
  function bootstrap(ngModule: string, {element, strictDi}?: {
    element?: AppRoot;
    strictDi?: boolean;
  }): void;

}
declare module ngMetadataCore{

  export interface Type extends Function {}

  export class OpaqueToken {
    private _desc;
    constructor(_desc: string);
    desc: string;
    toString(): string;
  }

  export type ProviderType = Type | string | OpaqueToken;
  /**
   * should extract the string token from provided Type and add $inject angular 1 annotation to constructor if @Inject
   * was used
   * @param type
   * @returns {string}
   */
  export function provide(type: ProviderType, {useClass, useValue}?: {
    useClass?: Type;
    useValue?: any;
  }): [string, Type];

  function Directive({selector, legacy}: {
    selector: string;
    legacy?: ng.IDirective;
  }): ClassDecorator;
  function Component({selector, template, templateUrl, inputs, attrs, outputs, legacy}: {
    selector: string;
    template?: string;
    templateUrl?: string;
    inputs?: string[];
    outputs?: string[];
    attrs?: string[];
    legacy?: ng.IDirective;
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
  export function HostListener(eventName:string): MethodDecorator;

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
   * - `OnInit` (after the first check only),
   * - `AfterContentInit`,
   * - `AfterContentChecked`,
   * - `AfterViewInit`,
   * - `AfterViewChecked`,
   * - `OnDestroy` (at the very end before destruction)
   */
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
}
declare module "ng-metadata/core" {
  export = ngMetadataCore;
}
declare module "ng-metadata/platform" {
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
