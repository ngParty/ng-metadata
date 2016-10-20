# Decorator

**Class Decorators**
- [@NgModule](#ngModule)
- [@Component](#component)
- [@Directive](#directive)
- [@Pipe](#pipe)
- [@Injectable](#injectable)

**Property Decorators**
- [@Input](#input)
- [@Output](#output)
- [@HostBinding](#hostbinding)
- [@HostListener](#hostlistener)
- [@ViewChild](#viewchild)
- [@ViewChildren](#viewchildren)
- [@ContentChild](#contentchild)
- [@ContentChildren](#contentchildren)

**Parameter Decorators**
- [@Inject](#inject)
- [@Host](#host)
- [@Optional](#optional)
- [@Self](#self)
- [@SkipSelf](#skipself)

---

## @NgModule

A decorator for adding NgModule metadata to a class.
NgModules are how we register our dependencies (such as Component, Directives, Pipes and Providers), both 1st and 3rd-party, with Angular's dependency injector.

They are conceptually similar to Angular 1's own `angular.module`.

*Example:*

```typescript
import { NgModule } from 'ng-metadata/core';

@NgModule({ 
  declarations: [ MyPipe, MyComponent ],
  providers: [ MyProvider ],
  imports: [ ThirdPartyModule ]
})
class MyModule {}
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **providers?**  | `Array<Injectable|Injectable[]|string>` |  Decorated providers. |
| **declarations?**  | `Array<Type|Type[]>` |  Decorated Components, Directives or Pipes`  |
| **imports?**  | `Array<Type|string>` |  Other decorated NgModule classes, or string names of Angular 1 modules  |
| **exports?**  | `Array<Type|any[]>` |  Not used, only here for interface compatibility |
| **entryComponents?**  | `Array<Type|any[]>` |  Not used, only here for interface compatibility |
| **bootstrap?**  | `Array<Type|any[]>` |  Not used, only here for interface compatibility |
| **schemas?**  | `Array<Type|any[]>` |  Not used, only here for interface compatibility |

## @Component

A decorator for adding component metadata to a class.
Components are essentially angular 1 directives with both a template, controller and isolate scope.
If you are looking to only modify the host element in some way, you should use @Directive.

*Example:*

```typescript
import { Component } from 'ng-metadata/core';

@Component({ 
  selector: 'greeter', 
  template: `Hello World!`,
  inputs: ['user'],
  outputs: ['onNameChange'] 
})
class GreeterComponent {}
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **selector**  | `string` |  The component's selector. It must be a css element selector, for example `app` or `my-thing` are valid, but `[my-attr]` or `.my-class` are invalid. |
| **template**  | `string` |  The template string for the component. You can bind to class instance properties by prepending your bindings with the selector in camel-case form, e.g. `<h1>My Component's Name is: {{ctrl.name}}</h1>`  |
| **templateUrl**  | `string` |  Path to an external html template file. Either template or templateUrl must be provided  |
| **changeDetection**  | `ChangeDetectionStrategy` |  Defines the used change detection strategy. When a component is instantiated with one way bindings via inputs `@Input('<')`, we can tell it explicitly how to propagate those bindings. The changeDetection property defines, whether the change detection will be checked every time or only when the component tells it to do so. |
| **inputs?**     | `Array<string>` |  same as `attrs` but binds via `=` two way binding to bindToController  |
| **outputs?**    | `Array<string>` |  same as `attrs` but binds via `&` expression binding to bindToController |
| **host?**       | `{[key: string]: string}` |  Specify the events, actions, properties and attributes related to the [host element](#host). |
| **providers?**  | `Array<Injectables|string>` | Any providers that this component or any of it's children depends on. If you provide string it has to be Angular 1 module name |
| **viewProviders?**  | `Array<Injectables|string>` | Any providers that this component or any of it's children depends on. In Angular 2 it defines the set of injectable objects that are visible to its view DOM children. In ng1 it will register it to global Injector, but it's good visual indication to register here just providers which should be used only within this component view. If you provide string it has to be Angular 1 module name |
| **moduleId?**   | `string` | The module id of the module that contains the component. Needed to be able to resolve relative urls for templates and styles. In CommonJS, this can always be set to `module.id`, similarly SystemJS exposes `__moduleName` variable within each module. |
| **legacy?**     | `Object<`[DirectiveDefinitionObject](#directivedefinitionobject)`>`  |  striped angular 1 ddo, use it if you wanna use angular 1 specific API  |

###### host

**Host Listeners**

Specifies which DOM events a directive listens to via a set of `(event)` to `method` key-value pairs:

- `event`: the DOM event that the directive listens to.
- `statement`: the statement to execute when the event occurs. If the evaluation of the statement returns `false`, then `preventDefault` is applied on the DOM event.

To listen to global events, a target must be added to the event name ( before the event separated with colon, like this `(target: click)`). 

The target can be:
 - `window`,
 - `document`
 - `body`

When writing a directive event binding, you can also refer to the `$event` local variable.

> There is a better way for using host with listeners, via method decorator [@HostListener](#hostlistener)

*example:*

> The following example declares a directive that attaches a click listener to the button and counts clicks.
> notice the `$event.target` and `btn` parameter in `onClick` method. Yes the target is the button :)

```typescript
import { Directive, Component } from 'ng-metadata/core';

@Directive({
  selector: '[counting]',
  host: {
    '(click)': 'onClick($event.target)'
  }
})
class CountClicks {
  numberOfClicks = 0;
  onClick(btn) {
    console.log("button", btn, "number of clicks:", this.numberOfClicks++);
  }
}
@Component({
  selector: 'app',
  template: `<button counting>Increment</button>`
})
class AppComponent {}
```

**Host Property Bindings**

Specifies which DOM properties a directive updates.
Angular automatically checks host property bindings during change detection. If a binding changes, it will update the host element of the directive.

You can bind to various host properties:
- `class.[yourClassname]`: it will toggle provided CSS class on DOM element if binding is true/false
- `attr.[yourStringAttribute]`: it will set provided DOM attribute to binding value
- `propertyName`: it will set provided DOM property to binding value


> There is a better way for using host with listeners, via method decorator [@HostBinding](#hostbinding)
*example:*

> The following example creates a directive that sets the valid and invalid classes on the DOM element that has ngModel directive on it.

```typescript
import { Directive, Component, Self } from 'ng-metadata/core';
import { NgModel } from 'ng-metadata/common'

@Directive({
  selector: '[validatorSign]',
  host: {
    '[class.valid]': 'valid',
    '[class.invalid]': 'invalid'
  }
})
class NgModelStatusDirective {
  constructor(@Self() public ngModel: NgModel) {}
  get valid() { return this.ngModel.$valid; }
  get invalid() { return this.ngModel.$invalid; }
}

@Component({
  selector: 'my-app',
  template: `<input ng-model="prop" validator-sign >`
})
class AppComponent{}
```

**Attributes**

Specifies static attributes that should be propagated to a host element.

*example:*
```typescript
import { Directive } from 'ng-metadata/core';

@Directive({
  selector: '[myButton]',
  host: {
    'role': 'button'
  }
})
class MyButtonDirective {}
```
```html
<!--raw html-->
<button my-button>hello</button>

<!--compiled-->
<button my-button role="button">hello</button>
```

###### DirectiveDefinitionObject:

- syntax is the same as for [Comprehensive Directive API](https://docs.angularjs.org/api/ng/service/$compile)
- this will override any generated DDO from decorators
- anyway you should need to override/use only following props:
  compile?: ng.IDirectiveCompileFn;
    - `controllerAs`: string;
    - `priority`: number;
    - `replace`: boolean;
    - `scope`: any;
    - `template`: any;
    - `templateNamespace`: string;
    - `templateUrl`: any;
    - `terminal`: boolean;
    - `transclude`: any;
    - `$routeConfig`: RouteConfig ( router-deprecated config )

    
> How to require other directives? Angular 2 uses DI for everything and now you can too!

Just inject needed directives via constructor.
Also note that instances of other directives are available only during `ngOnInit` or `ngAfterViewInit` life cycles,
because other controller instances are available during `preLink` or `postLink` of starting **Angular 1.5 during `$onInit` controller hook.

*example:*

So you used to use require property on your DDO
```
{require: ['ngModel','someFoo']}
```

now you do it this way:
```typescript
import { Directive, Component, Host, AfterViewInit, OnInit } from 'ng-metadata/core';
import { NgModel } from 'ng-metadata/common';

  @Directive({selector:'[someFoo]'})
  class SomeFooDirective{}
  
  @Component({ 
    selector:'foo',
    template:`<div>hello</div>`
  })
  class FooComponent implements AfterViewInit, OnInit {
    constructor(
      @Host() private ngModel: NgModel,
      @Host() private someFoo: SomeFooDirective
    ){
      // this.ngModel and this.someFoo are not yet available, they are undefined
    }
    ngOnInit(){
      // this.ngModel and this.someFoo are available because this method is called from preLink
    }
    ngAfterViewInit(){
      // this.ngModel and this.someFoo are available because this method is called from postLink
    }
  }
```
- `terminal?` If the compilation should stop here. [angular terminal](https://docs.angularjs.org/api/ng/service/$compile)
- `transclude?` By default we use **false**, you can use this to turn off transclusion or to use **element**. [angular transclusion](https://docs.angularjs.org/api/ng/service/$compile)
- `priority?`  [angular priority](https://docs.angularjs.org/api/ng/service/$compile)
- `controllerAs?`  The controller name used in the template. By default we use **$ctrl** like `angular.component` does

> There is a better way for using inputs/outputs via property decorators `@Input`, `@Output`


## @Directive

A decorator for adding directive metadata to a class. 
Directives differ from Components in that they don't have templates; they only modify the host element or add behaviour to it.

*Example:*

```typescript
import { Component, Directive, Inject, AfterViewInit } from 'ng-metadata/core';

@Directive({
  selector: '[classAdder]'
})
class ClassAdderDirective implements AfterViewInit {
  
   constructor( @Inject('$element') private $element: ng.IAugmentedJQuery) {}
   
   // every directive needs to implement this life cycle method
   ngAfterContentInit(){
     this.$element.addClass('foo');
   }
    
}

@Component({
  selector: 'my-app',
  template: `<div class-adder></div>`
})
class AppComponent{}
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **selector**  | `string` |  The directive's selector. It must be a css attribute selector, for example '[myThing]' is valid, but 'my-component' or '.my-class' are invalid. |
| **inputs?**     | `Array<string>` |  same as `attrs` but binds via `$scope.$eval` to controller  |
| **outputs?**    | `Array<string>` |  same as `attrs` but binds via `$scope.$evalAsync` to parent expression binding to controller |
| **host?**       | `{[key: string]: string}` |  Specify the events, actions, properties and attributes related to the [host element](#host). |
| **providers?**  | `Array<Injectables|string>` | Any providers that this component or any of it's children depends on. |
| **legacy?**     | `Object<`[DirectiveDefinitionObject](#directivedefinitionobject)`>`  |  striped angular 1 ddo, use it if you wanna use angular 1 specific API  |
Note:

- It is best to exec all logic within `ngAfterContentInit`/`ngAfterViewInit` method, because we are 100% sure, that host and children DOM is ready ( compiled ) 


## @Pipe

A decorator for adding pipe metadata to a class. Pipes are essentially the same as angular 1 filters.

*Example:*

```typescript
import { Pipe } from 'ng-metadata/core';

@Pipe({ name: 'firstLetter' })
class FirstLetter {
  
  // Optional
  constructor(){}

  // Mandatory
  transform(input, changeTo) {
    input[0] = changeTo;
    return input;
  }
  
  // Optional
  someHelper(){}
  
}
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **name**      | `string` | under what name should be the filter exposed in angular container/ view |
| **pure?**     | `boolean`[true] | If pipe is pure. If we wanna make pipe $stateful we set pure to `false` |

Note:
- every Pipe needs to implement `transform` method which contains pipe logic which will be transformed to filter factory
- as a convenience your pipe class can implement `PipeTransform` interface to get better dev experience


## @Injectable

A decorator that marks a class as injectable. It can then be injected into other annotated classes via the `@Inject` decorator.
This decorator is mandatory for all services because we are creating string name from DI manually

_Example:_

```typescript
// shared.ts
import { Injectable } from 'ng-metadata/core';

@Injectable()
export class MyService {
  getData() {}
}

@Injectable()
export class GoodService {
  getData() {}
}

@Injectable()
export class MyOtherService {

  data: any;
  
  constructor(
    myService: MyService,
    goodService: GoodService
  ) {
    this.data = myService.getData();
  }
}

// app.component
import { Component } from 'ng-metadata/core';
import { MyService, GoodService, MyOtherService } from './shared';

@Component({
  selector: 'my-app',
  template: `...`,
  providers: [MyService, GoodService, MyOtherService]
})
export class AppComponent{}

// app.module.ts
import { NgModule } from 'ng-metadata/core';

@NgModule({
  declarations: [AppComponent]
})
export class AppModule {}

// test.ts
import * as angular from 'angular';
import { expect } from 'chai';
import { getInjectableName, bundle } from 'ng-metadata/core';
import { AppModule } from './app.module';

const angular1Module = bundle( AppModule )

const $injector = angular.injector(angular1Module.name);

expect($injector.get('myService#1') instanceof MyService).to.equal(true)
expect($injector.get(getInjectableName(MyService)) instanceof MyService).to.equal(true)

expect($injector.get('fooSvc#2') instanceof GoodService).to.equal(true)
expect($injector.get(getInjectableName(GoodService)) instanceof GoodService).to.equal(true)

expect($injector.get('myOtherService#3') instanceof MyOtherService).to.equal(true)
expect($injector.get(getInjectableName(MyOtherService)) instanceof MyOtherService).to.equal(true)
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |

###### Behind the scenes:

We internally create unique name string token on InjectableMetadata, from class.name or we stringify it to get the 
name if JS engine doesn't implements ES6 name property


---


## @Input

An alternative and more declarative way to using the `inputs` property on `@Component`/`@Directive`.

Binds to Component/Directive via on of binding types `=`/`<`/`@` with the optional ? alias in Angular 1 syntax terms.

Binding type is determined by template or if you wanna keep template as is you have to provide on of these types within @Input(`BINDING_TYPE`)

Template bindings equivalent vs declaration bindings:

| Template       | Declaration @Input('TYPE') |
| -------------- | -------------------------- |
| `[(property)]` | `=`                        |
| `[property]`   | `<`                        |
| `property`     | `@`                        |


For example:
- If you wanna use one way binding on Component with no template change use `@Input('<') yourProperty`
- If you wanna use one way binding on Component with template syntax use `@Input() yourProperty` and in your template `<cmp [your-property]="$ctrl.someValue"></cmp>`

*Example:*

```typescript
import { Component, Input } from 'ng-metadata/core';

@Component({ ... })
class MenuDropdown {
  @Input() twoWay;
  @Input() oneWay;
  @Input('aliasMe') value;
  @Input() interpolatedValue: string;
}
```
```html
<menu-dropdown 
  [one-way]="ctrl.someValue"
  [alias-me]="ctrl.foo" 
  [(two-way)]="ctrl.options" 
  interpolated-value="{{ $ctrl.someValToInterpolate }}"
></menu-dropdown>
```

###### Parameters

| Parameter        | Type     | Description                               |
| ---------------- | ---------|------------------------------------------ |
| **exposedName**  | `string` | If provided, then it will be the name of the input when setting on the html element. It supports binding type override `TYPE` sign + followed by optional alias |


## @Output

An alternative and more declarative way to using the `outputs` property on `@Component`/`@Directive`.
Via `@Output` and `EventEmitter` you can emit custom events to parent component. These output parameters are optional in the template.

*Example:*

```typescript
import { Component, Output, EventEmitter } from 'ng-metadata/core';

@Component({ ... })
class MenuDropdown {
    @Output() onOptionSelect = new EventEmitter<void>();
    @Output('onAlias') onFoo = new EventEmitter<void>();

    someMethod() {
        this.onOptionSelect.emit();
    }
}
```
```html
<menu-dropdown 
  (on-option-select)="$ctrl.optionSelected()" 
  (on-alias)="$ctrl.onFoo()"
></menu-dropdown>
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **exposedName**  | `string` | If provided, then it will be the name of the attribute when setting on the html element via angular expression. |



## @HostBinding

- property decorator

Declares a host property binding.
An alternative and more declarative way to using the [host](#host) property on `@Component`/`@Directive`.

Angular automatically checks host property bindings during change detection. If a binding changes, it will update the host element of the directive.

*Example:*

> The following example creates a directive that sets the valid and invalid classes on the DOM element that has ngModel directive on it.

```typescript
import { Component, Directive, Inject, HostBinding } from 'ng-metadata/core';
import { FORM_DIRECTIVES } from 'ng-metadata/common';

@Directive({
  selector: '[validator-sign]'
})
class NgModelStatus {
  constructor(@Inject('ngModel') public ngModel: ng.INgModelController) {}
  @HostBinding('[class.valid]') valid = this.ngModel.$valid;
  @HostBinding('[class.invalid]') invalid = this.ngModel.$invalid;
}
@Component({
  selector: 'app',
  template: `<input ng-model="prop" validator-sign >`,
})
class AppComponent {}
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **hostPropertyName?**  | `string` | host elmenet property/class/attribute name, which will be updated by controller property value|

###### Behind scenes
just creates `$scope.$watch` on provided controller property and changes the DOM by used type `classname`(toggleClass)/`attribute`(attr)/`property`(setPathValue)


## @HostListener

- property decorator

Declares a host listener.
An alternative and more declarative way to using the [host](#host) property on `@Component`/`@Directive`.

Angular will invoke the decorated method when the host element emits the specified event.

If the decorated method returns `false`, then `preventDefault` is applied on the DOM event.

*Example:*

> The following example declares a directive that attaches a click listener to the button and counts clicks.

```typescript
import { Component, Directive, HostListener } from 'ng-metadata/core';

@Directive({
  selector: '[counting]'
})
class CountClicks {
  numberOfClicks = 0;
  
  @HostListener('click', ['$event.target'])
  onClick(btn) {
    console.log("button", btn, "number of clicks:", this.numberOfClicks++);
  }
}
@Component({
  selector: 'app',
  template: `<button counting>Increment</button>`,
})
class AppComponent {}
```

> Or you can attach to global target if you need

```typescript
import { Component, Directive, HostListener } from 'ng-metadata/core';

@Directive({
  selector: '[resizeHandler]'
})
class ResizeHandlerDirective {
  
  @HostListener('window: resize', ['$event'])
  onResize($event) {
    console.log('window resized!', $event);
  }
}
@Component({
  selector: 'app',
  template: `<div resize-handler>Hello World!</div>`,
})
class AppComponent {}
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **eventName**  | `string` | event name which the host element should listen to, or if used for global target use `target: eventName` where target can be one of `window` | `document` | `body`
| **args?**  | `string[]` | string path which property from $event should be passed to callback method |

###### Behind scenes
manually registers event listeners on host element via `.on(eventName)` and executes provided method within listener callback wrapped with `#scope.$applyAsync()` to notify whole app about possible changes



## @ViewChild

- property decorator

Configures a view query.
Queries component view, for only first match
View queries are set before the `ngAfterViewInit` callback is called.

**Note**
> if you are using ngIf/ngRepeat those instances won't be available during `ngAfterViewInit`
> if you implement this decorator and you wanna get notified about changes, implement `ngAfterViewChecked`
 and also inject this class to queried child

An alternative and more declarative way to using the [query](#query) property on `@Component`/`@Directive`.


*Example:*
```typescript
import { Component, Inject, forwardRef, ViewChild } from 'ng-metadata/core';

@Component({
  selector: 'item',
  template: `hello`
})
class ItemComponent{
  constructor(@Inject(forwardRef(()=>MyComponent)) private myCmp){}
}

@Component({
  selector:'my-cmp',
  template: `
    <item> a </item>
    <item> b </item>
    <item> c </item>
    <div> hello </div>
  `
})
class MyComponent {
  
  @ViewChild(ItemComponent) item: ItemComponent;
  @ViewChild('div') jqDiv: ng.IAugmentedJQuery;
  
  ngAfterViewInit(){
    console.assert(this.item instanceof ItemComponent);
    console.assert(this.jqDiv[0] instanceof HTMLDivElement);
  }
  
  ngAfterViewChecked(){
    console.log('view changed');
    console.log('you wont get notified if DIV changed, so beware of querying for DOM elements');
  }

}
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **selector**  | `Type` or `string` | Child Directive/Component class reference to Query. If string it will query the DOM and return jqLite instance|

###### Behind scenes
extracts the selectro from Type, queries the DOM for first match, then calls on found jqLite `.controller()`
to get queried component/directive. If not found returns `null`


## @ViewChildren

- property decorator

Similar to [@ViewChild](#viewchild), but querying for all occurrences not just one

*Example:*
```typescript
import { Component, Inject, forwardRef, ViewChildren } from 'ng-metadata/core';

@Component({
  selector: 'item',
  template: `hello`
})
class ItemComponent{
  constructor(@Inject(forwardRef(()=>MyComponent)) private myCmp){}
}

@Component({
  selector:'my-cmp',
  template: `
    <item> a </item>
    <item> b </item>
    <item> c </item>
    <div> hello </div>
    <div> hello </div>
  `
})
class MyComponent {
  
  @ViewChildren(ItemComponent) item: ItemComponent[];
  @ViewChildren('div') jqDiv: ng.IAugmentedJQuery[];
  
  ngAfterViewInit(){
    console.assert(this.item.length === 3);
    console.assert(this.jqDiv.length === 2);
  }
  
  ngAfterViewChecked(){
    console.log('view changed');
    console.log('you wont get notified if DIV changed, so beware of quering for DOM elements');
  }

}
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **selector**  | `Type` or `string` | Child Directive/Component class reference to Query. If string it will query the DOM and return jqLite instances|

returns `Array<T>`

###### Behind scenes
extracts the selector from Type, queries the DOM for all matches, then calls on found jqLite matches `.controller()`
to get queried component/directive. If not found returns `null`


## @ContentChild

- property decorator

Configures a content query.
Queries component content (html which is projected to `ng-transclude` slot), for only first match
Content queries are set before the `ngAfterContentInit` callback is called.

**Note**
> if you are using ngIf/ngRepeat those instances won't be available during `ngAfterContentInit`
> if you implement this decorator and you wanna get notified about changes, implement `ngAfterContentChecked`
 and also inject this class to queried child

An alternative and more declarative way to using the [query](#query) property on `@Component`/`@Directive`.


*Example:*
```typescript
import { Component, Inject, forwardRef, ContentChild } from 'ng-metadata/core';

@Component({
  selector: 'item',
  template: `hello`
})
class ItemComponent{
  // we need to inject this to notify parents ngAfterContentChecked with updates 
  constructor(@Inject(forwardRef(()=>MyComponent)) private myCmp){}
}

@Component({
  selector:'parent',
  template:`
    <my-cmp>
      <item> a </item>
      <item> b </item>
      <item> c </item>
      <div> hello </div>
      <div> hello </div>
    </my-cmp>
  `
})
class ParentComponent{}

@Component({
  selector:'my-cmp',
  template: `
    <ng-transclude></ng-transclude>
  `,
  legacy:{transclude:true}
})
class MyComponent {
  
  @ContentChild(ItemComponent) item: ItemComponent;
  @ContentChild('div') jqDiv: ng.IAugmentedJQuery;
  
  ngAfterContentInit(){
    console.assert(this.item instanceof ItemComponent);
    console.assert(this.jqDiv[0] instanceof HTMLDivElement);
  }
  
  ngAfterContentChecked(){
    console.log('view changed');
    console.log('you wont get notified if DIV changed, so beware of quering for DOM elements');
  }

}
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **selector**  | `Type` or `string` | Child Directive/Component class reference to Query. If string it will query the DOM and return jqLite instance|

###### Behind scenes
extracts the selectro from Type, queries the DOM from `ng-transclude` for first match, then calls on found jqLite `.controller()`
to get queried component/directive. If not found returns `null`



## @ContentChildren

- property decorator

Similar to [@ContentChild](#contentchild), but querying for all ocurrences not just one

*Example:*
```typescript
import { Component, Inject, forwardRef, ContentChildren } from 'ng-metadata/core';

@Component({
  selector: 'item',
  template: `hello`
})
class ItemComponent{
  constructor(@Inject(forwardRef(()=>MyComponent)) private myCmp){}
}

@Component({
  selector:'parent',
  template:`
    <my-cmp>
      <item> a </item>
      <item> b </item>
      <item> c </item>
      <div> hello </div>
      <div> hello </div>
    </my-cmp>
  `
})
class ParentComponent{}

@Component({
  selector:'my-cmp',
  template: `
    <ng-transclude></ng-transclude>
  `,
  legacy:{transclude:true}
})
class MyComponent {
  
  @ContentChildren(ItemComponent) item: ItemComponent[];
  @ContentChildren('div') jqDiv: ng.IAugmentedJQuery[];
  
  ngAfterContentInit(){
    console.assert(this.item.length === 3);
    console.assert(this.jqDiv.length === 2);
  }
  
  ngAfterContentChecked(){
    console.log('view changed');
    console.log('you wont get notified if DIV changed, so beware of quering for DOM elements');
  }

}
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **selector**  | `Type` or `string` | Child Directive/Component class reference to Query. If string it will query the DOM and return jqLite instances|

returns `Array<T>`

###### Behind scenes
extracts the selector from Type, queries the DOM within `ng-transclude` for all matches, then calls on found jqLite matches `.controller()`
to get queried component/directive. If not found returns `null`


---


## @Inject

> **module:** `ng-metadata/core`

A parameter decorator that declares the dependencies to be injected in to the class constructor, static or regular method.

You can Inject also local DI ( other directives/components ), 
but for this you have to provide additional decorator with one of possible modifiers:
- `@Host` for requiring via `^yourDirectiveName`
- `@Self` for requiring via `yourDirectiveName`
- `@SkipSelf`for requiring via `^^yourDirectiveName`

For optional require `?yourDirectiveName`, you have to use one of mentioned above + `@Optional`

If you will combine various local injection decorators we will throw an Error, just to let you know ;)
 

Also when injecting other controllers there are 2 constrains that must be met:
- all `@Inject` must be at tail of constructor arguments call
  - we throw explanatory errors if you'll break this rule
- Injectable has to have the same name as the argument name, which will be bind to controller instance

*Example:*

```typescript
// just singelton Injections -> creation of static $inject angular 1 annotation
import { Inject, Component } from 'ng-metadata/core';
import { MyService } from './myService';

@Component({...})
class MyOtherService {
  
  // MyService is custom service so we can inject it by reference
  constructor(
    @Inject('$q') private $q, 
    @Inject('$element') private $element, 
    @Inject(MyService) private myService
  ){}

  // also works on static methods
  static foo(@Inject('$log') $log) {}
  
  // also works on regular methods
  regularOne(@Inject('$log') $log) {}
  
}
```

```typescript
// Injecting global and local(other directives) 
import { Inject, Component, Directive, Host, Optional } from 'ng-metadata/core';

@Directive({selector:'[foo]'})
class FooDirective{}

@Component({
  selector:'hostCmp',
  template:`...`  
})
class HostCmp{
  constructor(
    // this just annotates class $inject to ['$log']
    @Inject('@log') private $log: ng.ILogService,
    // this will add require: ['^ngModel'] to DDO and bind the local instance within controller
    @Inject('ngModel') @Host() private ngModelCtrl: ng.INgModelController,
    // Argument name doesn't have to match to directive name, which is extracted via @Inject from decorated FooDirective
    // use whatever property name you want, we create instance via $injector.invoke with proper locals behind the scenes
    // - this will add require: ['?^foo'] to DDO and bind the local instance within controller to property foo
    @Host() @Optional() private foo: FooDirective
  ){}
}
```

> NOTE:
- when injecting a class from parent es2015 module in which is imported this class, you need to use [forwardRef](#forwardref), 
because parent class won't be available during module loading

*Example:*

This will throw `Reference error`

```typescript
// index.ts
import {AService} from './fileA';
import {BService} from './fileB';

// fileA.ts
import {BService} from './fileB';
import { Injectable } from 'ng-metadata/core';

Injectable()
class AService{
  constructor(private bSvc: BService){}
}

// fileB.ts
import {AService} from './fileA';
import { Inject, Injectable } from 'ng-metadata/core';


Injectable()
class BService{
  constructor(private aSvc: AService){}
}
```

This will work thanks to `forwardRef`

```typescript
// index.ts
import { AService } from './fileA';
import { BService } from './fileB';

// fileA.ts
import { BService } from './fileB';
import { Inject, Injectable, forwardRef } from 'ng-metadata/core';

Injectable()
class AService{
  constructor(private bSvc: BService){}
}

// fileB.ts
import { AService } from './fileA';
import { Inject, Injectable, forwardRef } from 'ng-metadata/core';


Injectable()
class BService{
  constructor(@Inject(forwardRef(()=>AService)) private aSvc: AService){}
}
```


###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **injectables**  | `string` or `class` or `OpaqueToken` | use string for angular 1 and 3rd party module injectables, use class reference for custom ones |

Note for Injectables:

- If string, then it's considered a core angular service such as $q or $http.
It could also be a special `local`, for example component's can inject $element, $attrs, $scope or $transclude
- It can be also an `OpaqueToken` instance
- If it's class it needs to be decorated by:
  - @Injectable for services
  - @Directive/@Component
  - @Pipe 
  - if you put there pure class it throws error

###### Behind the Scenes

The string names are extracted from `injectables` and are added to the `$inject` property of the class constructor function,


**Hierarchical Local Injections (directives requires):**

## @Host

Specifies that an injector should retrieve a local dependency from DOM until reaching the closest host.
In Angular 1 terms, with this we are telling angular that we wanna **require** another directive via injection.

It has to be used solely with `@Inject` to notify ngMetadata that we want to inject via local and look for that kind of Directive within DOM

It can be used together with `@Optional` to not throw error when required directive is not found

*example:*

> In the following example, Directive requires ngModel directive solely on itself, so we Inject it

```typescript
import { Directive, Inject, Host } from 'ng-metadata/core';

@Directive({ selector:'[validator]' })
class ValidatorDirective{
  constructor(@Inject('ngModel') @Host() private ngModel: ng.INgModelController){
    // here ngModel is defined
  }
  ngOnInit(){
    // this is called from custom controller
    this.ngModel.$validators.foo = (viewValue)=>{  /*...*/ }
  }
}

// behind the scenes this creates also a require constraint
const ddo = { require: ['validator','^ngModel'] };
// we always require itself on first place, and after are injected directives
```

###### Behind the Scenes

- we are creating instance within custom controller wrapper via $injector.invoke so we're traversing DOM manually via angular
require mechanism with `^` locator
- tells provider that this should be local dependency via `require` on ddo
- it creates require with `^` sign prefix to search for directives on host, and parent


## @Optional

A parameter metadata that marks a dependency as optional. Injector provides null if the dependency is not found.
- parameter needs to have `@Inject` and on of local constraint annotations (`@Host` | `@Self` | `@SkipSelf`)
- if there is no local constraint annotation we will throw error to let you know that you're doing something wrong ;)

*example:*

```typescript
import { Directive, Inject, Host, Optional } from 'ng-metadata/core';

@Directive({ selector:'[validator]' })
class ValidatorDirective{
  constructor(@Inject('ngModel') @Host() @Optional() private ngModel: ng.INgModelController){
    // here ngModel is defined and if not found it is null
  }
  ngOnInit(){
    if(this.ngModel){
      this.ngModel.$validators.foo = (viewValue)=>{  /*...*/ }
    }      
  }
}

// behind the scenes this creates just

const ddo = { require: ['validator','^?ngModel'] };
// we always require itself on first place, and after are injected directives
```

###### Behind the Scenes

- adds `?` optional sign prefix to `require`d directive


## @Self

Specifies that an Injector should retrieve a dependency only from itself.
- parameter needs to have `@Inject` decorator
- it can be used together with `@Optional` to not throw error when required directive is not found


*example:*

```typescript
import { Directive, Inject, Self } from 'ng-metadata/core';

@Directive({ selector:'[validator]' })
class ValidatorDirective{
  constructor(@Inject('ngModel') @Self() private ngModel: ng.INgModelController){
    // here ngModel is undefined
  }
  ngOnInit(){    
      // this is called from preLink, so controllers have been already instantiated
      this.ngModel.$validators.foo = (viewValue)=>{  /*...*/ }
  }
}

// behind the scenes this creates just

const ddo = { require: ['validator','ngModel'] };
// we always require itself on first place, and after are injected directives
```

###### Behind the Scenes

just restricts `require`d directive on host ( default `^` is removed )


## @SkipSelf

Specifies that the dependency resolution should start from the parent element.
- parameter needs to have `@Inject` decorator
- it can be used together with `@Optional` to not throw error when required directive is not found

*example:*

```typescript
import { Directive, Inject, SkipSelf } from 'ng-metadata/core';

@Directive({ selector:'[validator]' })
class ValidatorDirective{
  constructor(@Inject('ngModel') @SkipSelf() private ngModel: ng.INgModelController){
    // here ngModel is defined
  }
  ngOnInit(){    
      this.ngModel.$validators.foo = (viewValue)=>{  /*...*/ }
  }
}

// behind the scenes this creates just

const ddo = { require: ['validator','^^ngModel'] };
// we always require itself on first place, and after are injected directives
```

###### Behind the Scenes

just adds `^^` sign prefix to `require`d directive on host ( default `^` is removed )
