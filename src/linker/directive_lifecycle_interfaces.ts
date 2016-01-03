export enum LifecycleHooks {
  OnInit,
  OnDestroy,
  AfterContentInit,
  AfterViewInit
}

/**
 * @internal
 */
export var LIFECYCLE_HOOKS_VALUES = [
  LifecycleHooks.OnInit,
  LifecycleHooks.OnDestroy,
  LifecycleHooks.AfterContentInit,
  LifecycleHooks.AfterViewInit
];

/**
 * Lifecycle hooks are guaranteed to be called in the following order:
 * - `OnInit` (after the first check only),
 * - `AfterContentInit`,
 * - `AfterViewInit`,
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
export interface OnInit { ngOnInit(); }


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
export interface OnDestroy { ngOnDestroy(); }

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
export interface AfterContentInit { ngAfterContentInit(); }

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
export interface AfterViewInit { ngAfterViewInit(); }
