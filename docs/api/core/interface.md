# Interface

## Lifecycle hooks:

- [OnInit](#oninit)
- [OnChanges](#onchanges)
- [DoCheck](#docheck)
- [AfterContentInit](#aftercontentinit)
- [AfterContentChecked](#aftercontentchecked)
- [AfterViewInit](#afterviewtinit)
- [AfterViewChecked](#afterviewchecked)
- [OnDestroy](#ondestroy)

---

## OnInit

Implement this interface to execute custom initialization logic after your directive's data-bound properties have been initialized.

`ngOnInit` method:

- will be called on each controller(directive or component class) after all the controllers on 
an element have been constructed and had their bindings initialized  
This is a preferred place to put initialization code for your controller(component/directive)
- is only invoked once when the directive is instantiated
 
*NOTE:*
> Don't put initialization logic to `constructor` because if you inject locals(directives,components) they are not 
defined until `ngOnInit` is triggered

> In angular 1 terms, it is called from preLink
> In next major version (ngMetadata 2.0) it will use $onInit under the hood, which was introduced in angular 1.5

_Example:_

```typescript
```

###### Members

- `ngOnInit()`


## OnChanges

Implement this interface to get notified when any data-bound property of your directive changes.

Called whenever one-way (`@Input(<)`) or interpolation (`@Attr()`) bindings are updated. 
The `changes` parameter is a hash whose keys (implements `SimpleChange`) are the names of the bound properties that have changed, 
and the values are an object of the form `{ currentValue, previousValue, isFirstChange() }`. 

> you can use `SimpleChanges`(alias for `{[propName: string]: SimpleChange}`) for annotating `changes` parameter

Use this hook to trigger updates within a component such as cloning the bound value to prevent accidental mutation of the outer value.

`ngOnChanges` is called right after the data-bound properties have been checked and before view
and content children are checked if at least one of them has changed.

> NOTE: it works with both @Component and @Directive like angular 2 does, angular 1.5 does support onChanges only on component, 
so you are safe with ngMetadata ;)

_Example:_

```typescript
import { bootstrap } from 'ng-metadata/platform-browser-dynamic';
import { Component, Input, OnChanges, SimpleChanges } from 'ng-metadata/core';

@Component({
  selector: 'my-cmp',
  template: `
    <p>myProp = {{$ctrl.myProp}}</p>
    <p>myAttr = {{$ctrl.myAttr}}</p>
  `
})
class MyComponent implements OnChanges {
  @Input() myAttr: string;
  @Input() myProp: any;

  ngOnChanges(changes: SimpleChanges) {
    console.log('ngOnChanges - myProp = ' + changes['myProp'].currentValue);
    console.log('ngOnChanges - myAttr = ' + changes['myAttr'].currentValue);
  }
}

@Component({
  selector: 'app',
  template: `
   <button ng-click="value = value + 1">Change MyComponent</button>
   <button ng-click="str = str + 'world'">Change MyComponent attr</button>
   <my-cmp [my-prop]="$ctrl.value" my-attr="{{$ctrl.str}}"></my-cmp>
  `,
  directives: [MyComponent]
})
export class AppComponent {
  value = 0;
  str = 'hello';
}

bootstrap( AppComponent );
```

###### Members

- `ngOnChanges(changes: {[propName: string]: SimpleChange})`



## DoCheck

Implement this interface to get custom granular change detection observations.
We can use the DoCheck hook to detect and act upon changes that Angular doesn't catch on its own.

`ngDoCheck` gets called to check the changes in the directives.

The default change detection algorithm looks for differences by comparing bound-property values
by reference across change detection runs. When `DoCheck` is implemented it can be responsible for checking for changes.
                                                              
Implementing this interface allows improving performance by using insights about the component,
its implementation and data types of its properties ( but we don't recommend to use this in production, unless you know what you are doing).

**Note:**
- The `ngDoCheck` hook is called with enormous frequency — after every change detection cycle no matter where the change occurred 
(by change detection cycle we mean $digest loop in terms of Angular 1 ).
- Most of these initial checks are triggered by Angular's first rendering of unrelated data elsewhere on the page. Mere mousing into another input box triggers a call. Relatively few calls reveal actual changes to pertinent data. Clearly our implementation must be very lightweight or the user experience may suffer.
- directive should not implement both `DoCheck` and [`OnChanges`](#onchanges) at the same time.


// @TODO Differs services are not implemented yet, instead use custom changes handling [like shown here](https://angular.io/docs/ts/latest/guide/lifecycle-hooks.html#!#docheck)
Use `KeyValueDiffers` and `IterableDiffers` to add your custom check mechanisms.

_Example:_

In the following example `ngDoCheck` uses an `IterableDiffers` to detect the updates to the array `list`:

```typescript
import { Component, Input, DoCheck, IterableDiffers } from 'ng-metadata/core';

 @Component({
   selector: 'custom-check',
   template: `
    <p>Changes:</p>
    <ul>
      <li ng-repeat="line in $ctrl.logs">{{line}}</li>
    </ul>`
 })
 class CustomCheckComponent implements DoCheck {
   @Input() list: any[];
   differ: any;
   logs = [];
 
   constructor(differs: IterableDiffers) {
     this.differ = differs.find([]).create(null);
   }
 
   ngDoCheck() {
     const changes = this.differ.diff(this.list);
 
     if (changes) {
       changes.forEachAddedItem(r => this.logs.push('added ' + r.item));
       changes.forEachRemovedItem(r => this.logs.push('removed ' + r.item))
     }
   }
 }
 
 @Component({
   selector: 'app',
   template: `
    <button ng-click="$ctrl.list.push($ctrl.list.length)">Push</button>
    <button ng-click="$ctrl.list.pop()">Pop</button>
    <custom-check [list]="$ctrl.list"></custom-check>`,
   directives: [ CustomCheckComponent ]
 })
 export class AppComponent {
   list = [];
 }
```

###### Members

- `ngDoCheck()`



## AfterViewInit

Use this hook only with `@Component()`

Implement this interface to get notified when your component's view and content is fully initialized.

`ngAfterViewInit` is called after all component's content children and view children have been resolved and rendered. 

It is invoked every time when the directive is instantiated. 

In angular 1 terms, this method is invoked from `postLink`

**Note:**
> when `@Query` decorators are used, you can be 100% sure that during this life cycle all queried instances/jqElements
**which are not transcluded(behind ng-if or ng-repeat)** will be resolved
> If you wanna query results from repeater or dynamically, implement `AfterViewChecked` to get notifications ans updated instance properties

_Example:_

```typescript
```

###### Members

- `ngAfterViewInit()`


## AfterViewChecked

Implement this interface to get notified after every check of your component's view.

`ngAfterViewChecked` is called after all directive's view children(view==template) have been resolved and rendered. 

It is invoked every time when the directive is instantiated/destroyed. 

In angular 1 terms, this method is invoked from it's own `postLink` and from childrens's `postLink` and `scope.$on('$destroy')` , to prevent memory leaks

**Note:**
> Implement this interface only on parent component which uses one of `@ViewChild`/`@ViewChildren` decorators
> To get notified you must explicitly `@Inject` your parent component to child, so it knows about it's parent
and calls life cycle hooks properly

_Example:_

```typescript
```

###### Members

- `ngAfterViewChecked()`


## AfterContentInit

Use this only with `@Directive()`

Implement this interface to get notified when your directive's content fully initialized.

`ngAfterContentInit` is called after all directive's content children have been resolved and rendered. 

It is invoked every time when the directive is instantiated. 

In angular 1 terms, this method is invoked from `postLink`

**Note:**
> when `@Query` decorators are used, you can be 100% sure that during this life cycle all queried instances/jqElements 
which are projected via ng-transclude and **which are not dynamicly rendered(with ng-if or ng-repeat)** will be resolved
> If you wanna query results from repeater or dynamically, implement `AfterContentChecked` to get notifications ans updated instance properties

_Example:_

```typescript
```

###### Members

- `ngAfterContentInit()`


## AfterContentChecked

Implement this interface to get notified after every check of your directive's content.

`ngAfterContentChecked` is called after all directive's content children(content projected via `ng-transclude`) have been resolved and rendered. 

It is invoked every time when the directive is instantiated and when content directives are created/destroyed. 

In angular 1 terms, this method is invoked from it's own `postLink` and from children's `postLink` and `scope.$on('$destroy')` , to prevent memory leaks

**Note:**
> Implement this interface only on parent component/directive which uses one of `@ContentChild`/`@ContentChildren` decorators
> To get notified you must explicitly `@Inject` your parent component/directive to child, so it know about it's parent
and calls life cycle hooks properly

_Example:_

```typescript
```

###### Members

- `ngAfterContentChecked()`


## OnDestroy

Implement this interface to get notified when your directive is destroyed.

`ngOnDestroy` callback is typically used for any custom cleanup that needs to occur when the
instance(directive) is destroyed.

In angular 1 terms, it's invoked when `$scope.$destroy()` is called.

_Example:_

```typescript
```

###### Members

- `ngOnDestroy()`
