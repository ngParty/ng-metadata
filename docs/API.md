## API

Angular 1 bootstrap:

`ng-metadata/platform`
- [bootstrap](#bootstrap)

Angular 1 container registration helper Methods:

`ng-metadata/core` 
- [provide](#provide)
- [getInjectableName](#getinjectablename)
- [forwardRef](#forwardref)

Testing helpers:

`ng-metadata/testing`
- [renderFactory](#renderfactory)
- [getInput](#getinput)

Classes:

`ng-metadata/core`
- [OpaqueToken](#opaquetoken)

Decorators:

`ng-metadata/core`
- [@Component](#component)
- [@Directive](#directive)
- [@Input](#input)
- [@Output](#output)
- [@Attr](#output)
- [@HostBinding](#hostbinding)
- [@HostListener](#hostlistener)
- [@Pipe](#pipe)
- [@Inject](#inject)
- [@Injectable](#injectable)
- [@Host](#host)
- [@Optional](#optional)
- [@Self](#self)
- [@SkipSelf](#skipself)

Lifecycle hooks:

`ng-metadata/core`
- [OnInit](#oninit)
- [AfterContentInit](#aftercontentinit)
- [AfterViewInit](#afterviewtinit)
- [OnDestroy](#ondestroy)

Static methods on Component/Directive classes (angular 1 specific API)

- [compile](#ddocompile)
- [link](#ddolink)


---

**Angular 1 bootstrap:**

## bootstrap

> **module:** `ng-metadata/platform`

Used to bootstrap your application manually after DOMContentLoaded is fired. Do **not** use the `ng-app` directive.

*example:*

```typescript
import { provide, Component } from 'ng-metadata/core';
import { bootstrap } from 'ng-metadata/platform';


@Component({ selector: 'app', template: 'Hello World!' })
class App { }

const AppModule = angular.module('app', [])
  .directive( ...provide(App) );

bootstrap(AppModule);
```

###### Parameters

| Parameter     | Type                            | Description                               |
| ------------- | ------------------------------- |------------------------------------------ |
| **ngModule**  | `ngModule`                      | angular module                            |
| **element?**  | `Element` or `string`(selector) | you can provide on which element or selector you want to boot your app. Default element is `document` |

returns `undefined`

###### Behind the Scenes

`angular.bootstrap` is called on the page element that matches the element parameter or by default on `document`. 
This action is invoked inside `angular.element( document ).ready` function. 

---

**Angular 1 container registration helper Methods:**

## provide 

> **module:** `ng-metadata/core`

Returns tuple`[name:string,Type:any]` `name` and appropriate `Type` by used decorator.
It's smart ( it knows if argument is Component or Directive or Pipe or Service ).

Has to be used with these `angular.*` methods as first argument via spread because angular methods require 2 args:
- `directive`
- `filter`
- `service`
- `value`
- `constant`

*Example:*

this:

```typescript
import * as angular from 'angular';
import {provide, Component} from 'ng-metadata/core';

@Component({selector:'hero-cmp',template:`<div>hello hero</div>`})
class HeroCmp{}

angular.module('hero',[])
  .directive( ...provide(HeroCmp) );
```

will register as `angular.directive('heroCmp', function directiveFactory(){ return {} })`.  


> For Services which have @Injectable, by default, it will extract the generated `id` token

so this:

```typescript
import * as angular from 'angular';
import {provide} from 'ng-metadata/core';
import {HeroSvc} from './hero.service';

angular.module('hero',[])
  .service( ...provide(HeroSvc) );
```

will register as `angular.service('heroSvc#12', HeroSvc)`

###### Parameters

| Parameter         | Type                            | Description                               |
| ----------------- | ------------------------------- |------------------------------------------ |
| **token**         | `class` or `string` or `OpaqueToken`        | class reference or string alias token     |
| **provideType?**  | `{useClass: class}` or `{useValue: any}`    | This is applicable only for angular `service`,`constant`,`value`,`factory`,`provider` methods |

returns tuple [`string`,`factory`] which is registered within angular container.

`useClass` - you have to specify your Class and string which you want to alias it. Note that once you do that, you have to
use this string across whole app

*example:*

```typescript
import * as angular from 'angular';
import {provide, Inject} from 'ng-metadata/core';

class MyService{}

angular.module('myApp')
  .constant(...provide('mySvc',{useClass:MyService));

// now when you are injecting the constant in some service or so
export class MyLogger{
  constructor(
    @Inject('mySvc') private mySvc: MyService
  ){}
}
```

`useValue` - neat helper if you wanna register values or constants. It is advised to create opaque token for injectable, so you
don't use strings but references

*example:*

```typescript
import * as angular from 'angular';
import {provide, Inject, OpaqueToken} from 'ng-metadata/core';

export const myConstToken = new OpaqueToken('myConstanstYo');
export const myConstants = {foo:123123,moo:'12312'};

angular.module('myApp')
  .constant(...provide(myConstToken,{useValue:myConstants));
    
// now when you are injecting the constant in some service or so
export class MyService{
  constructor(
    @Inject(myConstToken) private myConst: typeof myConstants
  ){}
}
```

###### Behind the Scenes

`provide` extract name from various Types, which should be used for registration within angular.* methods.

- for **Injectable** it extraxts `id` property which is generated during class decoration. `id` is auto generated
- for **Component/Directive** it extracts `selector` property and transforms it to camel case
- for **Pipe** it extracts `name` property and transforms it to camel case
- for **Service** it extracts `name` from class property if supported by JS engine, or stringifies function name, and transforms it to camel case
( if useClass used the token overrides default behaviour )


## getInjectableName

> **module:** `ng-metadata/core`

A utility function that can be used to get the angular 1 injectable's name. Needed for some cases, since
injectable names are auto-created.

Works for string/OpaqueToken/Type
Note: Type must be decorated with one of class decorators(`@Injectable`,`@Component`,`@Directive`,`@Pipe`), otherwise it throws
 
*example:*

```typescript
import { Injectable, Component, Pipe, getInjectableName } from 'ng-metadata/core';
// this is given some random name like 'myService48' when it's created with `module.service`
 
@Injectable
class MyService {}

@Component({selector:'my-cmp',template:'...'})
class MyComponent{}

@Pipe({name:'kebabCase'})
class MyPipe{}
 
 
import {expect} from 'chai';

expect(getInjectableName(MyService)).to.equal('myService48');
expect(getInjectableName(MyComponent)).to.equal('myCmp');
expect(getInjectableName(MyPipe)).to.equal('kebabCase');
```

## forwardRef

> **module:** `ng-metadata/core`

Allows to refer to references which are not yet defined.

For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of DI is declared,
but not yet defined. It is also used when the `token` which we use when creating a query is not yet defined.

###### Parameters

| Parameter         | Type                  | Description                               |
| ----------------- | ----------------------|------------------------------------------ |
| **forwardRefFn**  | `ForwardRefFn`        | callback function which returns demanded Injectable |

> ForwardRefFn:
>   An interface that a function passed into forwardRef has to implement. `const ref = forwardRef(() => Lock);`
 
*example:*

```typescript
import * as angular from 'angular';
import {Injectable, Inject, forwardRef, provide, getInjectableName} from 'ng-metadata/core';

@Injectable()
class Door {
  lock: Lock;
  constructor(@Inject(forwardRef(() => Lock)) lock: Lock) { this.lock = lock; }
}

// Only at this point Lock is defined.
@Injectable()
class Lock {}

angular.module('myApp',[])
  .service(...provide(Lock))
  .service(...provide(Door));


//test.ts
import { expect } from 'chai';

const $injector = angular.injector(['ng','myApp']);

const door = $injector.get(getInjectableName(Door));
expect(door instanceof Door).to.equal(true);
expect(door.lock instanceof Lock).to.equal(true);
```

---

**Testing helpers:**

## renderFactory
 
> **module:** `ng-metadata/testing`

Helper for compiling Component/Directive classes within you unit test.
Use pattern shown in example:
  - create local render variable with interface IRender to tell tsc what type it would be
  - init it when you got $scope and $compile in beforeEach
  - use it within the test
    - if you want to override the inferred type from Directive argument use that via `<>` operator

*Example:*

```typescript
// my-component.ts
import {Component, Inject, Host} from 'ng-metadata/core';

@Component({ 
  selector:'my-component',
  template:'hello {{ $ctrl.greeting }}'
})
class MyComponent{
  
  greeting: string;
  
  constructor(@Inject('ngModel') @Host() private ngModel){}
  
  ngAfterViewInit(){
    this.ngModel.$render = ()=>{
      this.greeting = angular.copy(this.ngModel.$viewValue);
    }
  }
}

// my-component.spec.ts
import * as angular from 'angular';
import {expect} from 'chai';
import { MyModule } from './my';
import { MyComponent } from './my-component';
import { renderFactory, IRender } from 'ng-metadata/testing';

let $compile: ng.ICompileService;
let $rootScope: ng.IRootScopeService;
let $scope;
let render: IRender;

describe(`MyComponent`, ()=>{
  
  beforeEach(() => {

    angular.mock.module(MyModule);

  });
  
  beforeEach(angular.mock.inject((_$injector_: ng.auto.IInjectorService) => {

    const $injector = _$injector_;

    $compile = $injector.get<ng.ICompileService>('$compile');
    $rootScope = $injector.get<ng.IRootScopeService>('$rootScope');
    $scope = $rootScope.$new();

    render = renderFactory($compile,$scope);

  }));
  
  it(`should create the DOM and compile`, ()=>{
    const attrs = { 'ng-model':'model'};
    $scope.model = 'Martin!';
    
    // here we go!
    // it returns instance and compiled DOM
    const {compiledElement, ctrl} = render(MyComponent, {attrs});
    
    expect(ctrl instanceof MyComponent).to.equal(true);
    expect(compiledElement[0]).to.equal('<my-component ng-model="model">hello Martin!</my-component>');
  })
  
})
```

###### Parameters

| Parameter     | Type                            | Description                                  |
| ------------- | ------------------------------- |--------------------------------------------- |
| **$compile**  | `ng.ICompileService`            | core angular 1 $compile service from ng.mock |
| **$scope**    | `ng.IScope`                     | child scope for your component               |

returns render `Function`

###### Behind the Scenes

it builds whole DOM for component/directive, so you don't need to bother with html strings in your test.
Within it calls angular 1 well known $compile with provided $scope and re runs $digest loop to reflect the changes. 


## getInput
 
> **module:** `ng-metadata/testing`

- gets input element from provided jqElement

---

**Classes:**

## OpaqueToken

> **module:** `ng-metadata/core`

Creates a token that can be used in a DI Provider.

Using an OpaqueToken is preferable to using strings as tokens because of possible collisions caused by multiple providers using the same string as two different tokens.

*example:*

```typescript
import * as angular from 'angular';
import {OpaqueToken, provide, getInjectableName} from 'ng-metadata/core';

const key = new OpaqueToken("value");
const someConstant = 'Dont change me DI!';

angular.module('myApp',[])
  .constant(...provide(key,{useValue:someConstant}));

// test.ts
import {expect} from 'chai';
var $injector = angular.injector(['ng','myApp']);

expect($injector.get(getInjectableName(key))).to.equal('Dont change me DI!');
```

---

**Decorators:**

## @Component

> **module:** `ng-metadata/core`

A decorator for adding component metadata to a class. 
Components are essentially angular 1 directives with both a template, controller and isolate scope. 
If you are looking to only modify the host element in some way, you should use @Directive.

*Example:*

```typescript
import { provide, Component } from 'ng-metadata/core';

@Component({ 
  selector: 'greeter', 
  template: `Hello World!`,
  attrs: ['mood'],
  inputs: ['user'],
  outputs: ['onNameChange'] 
})
class Greeter {}

const AppModule = angular.module('app', [])
  .directive( ...provide(Greeter) );
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **selector**  | `string` |  The component's selector. It must be a css element selector, for example `app` or `my-thing` are valid, but `[my-attr]` or `.my-class` are invalid. |
| **template**  | `string` |  The template string for the component. You can bind to class instance properties by prepending your bindings with the selector in camel-case form, e.g. `<h1>My Component's Name is: {{ctrl.name}}</h1>`  |
| **templateUrl**  | `string` |  Path to an external html template file. Either template or templateUrl must be provided  |
| **attrs?**  | `Array<string>` |  String Array of names which you want to expose in bindToController via attribute `@` binding. *Example:* `attrs: ['foo']` will connect the class property `foo` to the attribute `foo`. You can also rename the attrs, *example* `attr:['foo: theFoo']` connects `foo` to the attribute `the-foo`.  |
| **inputs?**     | `Array<string>` |  same as `attrs` but binds via `=` two way binding to bindToController  |
| **outputs?**    | `Array<string>` |  same as `attrs` but binds via `&` expression binding to bindToController |
| **host?**       | `{[key: string]: string}` |  Specify the events, actions, properties and attributes related to the [host element](#host). |
| **providers?**  | `Array<Injectables|string>` | Any providers that this component or any of it's children depends on. This isn't doing anything for now, just for visual experience and mirroring ng2 api |
| **directives?** | `Array<Directive|Component|string>` | Any directives or components that this component or any of it's children depends on. This isn't doing anything, just for visual experience and mirroring ng2 api |
| **pipes?**      | `Array<Pipes|string>` | Any pipes that this component or any of it's children depends on. This isn't doing anything for now, just for visual experience and mirroring ng2 api |
| **legacy?**     | `Object<`[DirectiveDefinitionObject](#directivedefinitionobject)`>`  |  striped angular 1 ddo, use it if you wanna use angular 1 specific API  |

###### host

**Host Listeners**

Specifies which DOM events a directive listens to via a set of `(event)` to `method` key-value pairs:

- `event`: the DOM event that the directive listens to.
- `statement`: the statement to execute when the event occurs. If the evaluation of the statement returns `false`, then `preventDefault` is applied on the DOM event.

When writing a directive event binding, you can also refer to the `$event` local variable.

> There is a better way for using host with listeners, via method decorator [@HostListener](#hostlistener)

*example:*

> The following example declares a directive that attaches a click listener to the button and counts clicks.
> notice the `$event.targer` and `btn` parameter in `onClick` method. Yes the target is the button :)

```typescript
import {Directive,Component} from 'ng-metadata/core';

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
  template: `<button counting>Increment</button>`,
  directives: [CountClicks]
})
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
import {Directive,Component, Inject} from 'ng-metadata/core';
import {FORM_DIRECTIVES} from 'ng-metadata/common'

@Directive({
  selector: '[validator-sign]',
  host: {
    '[class.valid]': 'valid',
    '[class.invalid]': 'invalid'
  }
})
class NgModelStatus {
  constructor(@Inject('ngModel') public ngModel: ng.INgModelController) {}
  get valid() { return this.ngModel.$valid; }
  get invalid() { return this.ngModel.$invalid; }
}
@Component({
  selector: 'app',
  template: `<input ng-model="prop" validator-sign >`,
  directives: [FORM_DIRECTIVES]
})
```

**Attributes**

Specifies static attributes that should be propagated to a host element.

*example:*
```typescript
import {Directive} from 'ng-metadata/core';

@Directive({
  selector: '[my-button]',
  host: {
    'role': 'button'
  }
})
class MyButton {
}
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

    
> How to require other directives? Angular 2 uses DI for everything and now you can too!

Just inject needed directives via constructor.
Also note that instances of other directives are available only during `ngOnInit` or `ngAfterViewInit` life cycles,
because other controller instances are available during `preLink` or `postLink` of starting **Angular 1.5 during `$onInit` controller hook 

*example:*

So you used to use require property on your DDO
```
{require: ['ngModel','someFoo']}
```  

now you do it this way:
```typescript
import {Directive,Component, Inject, Host, AfterContentInit} from 'ng-metadata/core';

  @Directive({selector:'[some-foo]'})
  class SomeFooDirective{}
  
  @Component({ 
    selector:'foo',
    template:`<div>hello</div>`    
  })
  class Foo implements AfterContentInit{
    constructor(
      @Inject('ngModel') @Host() private ngModel: ng.INgModelController,
      @Inject(SomeFooDirective) @Host() private someFoo: SomeFooDirective
    ){
      // this.ngModel and this.someFoo are not yet available, they are undefined
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

> There is a better way for using attrs/inputs/outputs via property decorators `@Attr`,`@Input`,`@Output`


## @Directive

> **module:** `ng-metadata/core`

A decorator for adding directive metadata to a class. 
Directives differ from Components in that they don't have templates; they only modify the host element or add behaviour to it.

*Example:*

```typescript
import { Directive, Inject, AfterContentInit, provide } from 'ng-metadata/core';

@Directive({ 
  selector: '[class-adder]'
})
class ClassAdder implements AfterContentInit{
  
   constructor( @Inject('$element') private $element: ng.IAugmentedJQuery) {}
   
   // every directive needs to implement this life cycle method
   ngAfterContentInit(){
     this.$element.addClass('foo');
   }
    
}

const AppModule = angular.module('app', [])
  .directive(...provide(ClassAdder));
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **selector**  | `string` |  The directive's selector. It must be a css attribute selector, for example '[my-thing]' is valid, but 'my-component' or '.my-class' are invalid. |
| **attrs?**  | `Array<string>` |  String Array of names which you want to expose to controller via attribute received within `$attrs.$observe` fn. *Example:* `attrs: ['foo']` will connect the class property `foo` to the attribute `foo`. You can also rename the attrs, *example* `attr:['foo: theFoo']` connects `foo` to the attribute `the-foo`.  |
| **inputs?**     | `Array<string>` |  same as `attrs` but binds via `$scope.$eval` to controller  |
| **outputs?**    | `Array<string>` |  same as `attrs` but binds via `$scope.$evalAsync` to parent expression binding to controller |
| **host?**       | `{[key: string]: string}` |  Specify the events, actions, properties and attributes related to the [host element](#host). |
| **providers?**  | `Array<Injectables|string>` | Any providers that this component or any of it's children depends on. This isn't doing anything for now, just for visual experience and mirroring ng2 api |
| **legacy?**     | `Object<`[DirectiveDefinitionObject](#directivedefinitionobject)`>`  |  striped angular 1 ddo, use it if you wanna use angular 1 specific API  |
Note:

- It is best to exec all logic within `ngAfterContentInit` method, because we are 100% sure, that host and children DOM is ready ( compiled ) 


## @Input

> **module:** `ng-metadata/core`

An alternative and more declarative way to using the `inputs` property on `@Component`/`@Directive`.

Binds to controller via `=` binding or gets expression on directive via `$scope.$watch`

*Example:*

```typescript
import { Component, Input } from 'ng-metadata/core';

@Component({ ... })
class MenuDropdown {
  @Input() options;
  @Input('aliasMe') value;
}
```
```html
<menu-dropdown options="ctrl.options" alias-me="ctrl.foo"></menu-dropdown>
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **exposedName**  | `string` | If provided, then it will be the name of the input when setting on the html element. |


## @Output

> **module:** `ng-metadata/core`

An alternative and more declarative way to using the `outputs` property on `@Component`/`@Directive`.

Binds to controller via `&` binding or executes expression on directive via `$scope.$eval`

*Example:*

```typescript
import { Component, Output } from 'ng-metadata/core';

@Component({ ... })
class MenuDropdown {
    @Output() onOptionSelect: Function;
    @Output('onAlias') onFoo: Function;

    someMethod() {
        this.onOptionSelect();
    }
}
```
```html
<menu-dropdown on-option-select="ctrl.optionSelected()" on-alias="ctrl.onFoo()"></menu-dropdown>
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **exposedName**  | `string` | If provided, then it will be the name of the attribute when setting on the html element via angular expression. |


## @Attrs

> **module:** `ng-metadata/core`

An alternative and more declarative way to using the `attrs` property on `@Component`/`@Directive`.

Binds to controller via `@` binding or observes attirbute on directive via `$attrs.observe` and sets $ctrl instance 
value

*Example:*

```typescript
import { Component, Attr } from 'ng-metadata/core';

@Component({ ... })
class Colors {
    @Attr() primary: string;
    @Attr('otherOne') secondary: string;
}
```
```html
<colors primary="{{ctrl.colorRed}}" other-one="blue"></colors>
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **exposedName**  | `string` | If provided, then it will be the name of the attribute when setting on the html element. |


## @HostBinding

> **module:** `ng-metadata/core`

- property decorator

Declares a host property binding.
An alternative and more declarative way to using the [host](#host) property on `@Component`/`@Directive`.

Angular automatically checks host property bindings during change detection. If a binding changes, it will update the host element of the directive.

*Example:*

> The following example creates a directive that sets the valid and invalid classes on the DOM element that has ngModel directive on it.

```typescript
import { Component, Directive, Inject, HostBinding } from 'ng-metadata/core';
import {FORM_DIRECTIVES} from 'ng-metadata/common';

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
  directives: [FORM_DIRECTIVES]
})
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **hostPropertyName?**  | `string` | host elmenet property/class/attribute name, which will be updated by controller property value|

###### Behind scenes
just creates `$scope.$watch` on provided controller property and changes the DOM by used type `classname`(toggleClass)/`attribute`(attr)/`property`(setPathValue)


## @HostListener

> **module:** `ng-metadata/core`

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
  directives: [CountClicks]
})
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **eventName**  | `string` | event name which the host element should listen to |
| **args?**  | `string[]` | string path which property from $event should be passed to callback method |

###### Behind scenes
manualy registers event listeners on host element via `.on(eventName)` and executes provided method within listener callback wrapped with `#scope.$applyAsync()` to notify whole app about possible changes


## @Pipe

> **module:** `ng-metadata/core`

A decorator for adding pipe metadata to a class. Pipes are essentially the same as angular 1 filters.

*Example:*

```typescript
import { Pipe } from 'ng-metadata/core';

@Pipe({name:'firstLetter'})
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


## @Inject

> **module:** `ng-metadata/core`

A parameter decorator that declares the dependencies to be injected in to the class constructor, static or regular method.

You can Inject also local DI ( other directives/components ), but for this you have to provide `@Host` decorator with one of possible modifiers:
- `@Optional`
- `@Self`
- `@SkipSelf`

Also when injecting other controllers there are 2 constrains that must be met:
- all `@Inject` must be at tail of constuctor arguments call
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
    // this will add require: ['^ngModel'] to DDO and bind the instance from ngOnInit or ngAfter***Init
    @Inject('ngModel') @Host() private ngModel: ng.INgModelController,
    // this will add require: ['?^foo'] to DDO and bind the instance from ngOnInit or ngAfter***Init
    // Notice that argument name has to match to directive name, which is extracted via @Inject from decorated FooDirective
    // @Inject(FooDirective) === 'foo' because it has selector `[foo]`
    @Inject(FooDirective) @Host() @Optional() private foo: FooDirective
  ){}
}

```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **injectables**  | `string` or `class` or `OpaqueToken` | use string for angular 1 and 3rd party module injectables, use class reference for custom ones |

Note for Injectables:
- If string, then it's considered a core angular service such as $q or $http.
It could also be a special `local`, for example component's can inject $element, $attrs, $scope or $transclude
- If it's class it needs to be decorated by:
  - @Injectable for services
  - @Directive/@Component
  - @Pipe 
  - if you put there pure class it throws error

###### Behind the Scenes

The string names are extracted from `injectables` and are added to the `$inject` property of the class constructor function,


**Hierarchical Local Injections ( directives requires ):**

## @Host

Specifies that an injector should retrieve a local dependency from DOM until reaching the closest host.
In Angular 1 terms, with this we are telling angular that we wanna **require** another directive via injection.

It has to be used solely with `@Inject` to notify ngMetadata that it should not add this to `$inject` property on class,
but rather to create `require` property on DDO.

This is the base for following Decorators related to Injection: `@Optional`/`@Self`/`@SkipSelf`

> **NOTE:** 
> directive injections has to be at tail in constructor, if you will mix the order with regular injections, we will throw proper error
to let you know what's wrong
> the directive name within `@Inject('directiveName')` needs to be same name as property to whic you are assigning it
> this won't work: `constructor(@Inject('ngModel') @Host() @Self() private modelCtrl: ng.INgModelController){}`
> this will work: `constructor(@Inject('ngModel') @Host() @Self() private ngModel: ng.INgModelController){}`  

*example:*

> In the following example, Directive requires ngModel directive solely on itself, so we Inject it

```typescript
import {Directive, Inject, Host} from 'ng-metadata/core';

@Directive({selector:'[validator]'})
class ValidatorDirective{
  constructor(@Inject('ngModel') @Host() private ngModel: ng.INgModelController){
    // here ngModel is undefined
  }
  ngOnInit(){
    // this is called from preLink, so controllers have been already instantiated
    this.ngModel.$validators.foo = (viewValue)=>{  /*...*/ }
  }
}

// behind the scenes this creates just

const ddo = { require: ['validator','^ngModel'] };
// we always require itself on first place, and after are injected directives
```

###### Behind the Scenes

- tells provider that this should be local dependency via `require` on ddo
- it creates require whit `^` sign prefix to search for directives on host, and parent


## @Optional

A parameter metadata that marks a dependency as optional. Injector provides null if the dependency is not found.
- parameter needs to have `@Inject` and `@Host` decorators

*example:*

```typescript
import {Directive, Inject, Host, Optional} from 'ng-metadata/core';

@Directive({selector:'[validator]'})
class ValidatorDirective{
  constructor(@Inject('ngModel') @Host() @Optional() private ngModel: ng.INgModelController){
    // here ngModel is undefined
  }
  ngOnInit(){
    if(this.ngModel){
      // this is called from preLink, so controllers have been already instantiated
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
- parameter needs to have `@Inject` and `@Host` decorators

*example:*

```typescript
import {Directive, Inject, Host, Self} from 'ng-metadata/core';

@Directive({selector:'[validator]'})
class ValidatorDirective{
  constructor(@Inject('ngModel') @Host() @Self() private ngModel: ng.INgModelController){
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
- parameter needs to have `@Inject` and `@Host` decorators

*example:*

```typescript
import {Directive, Inject, Host, SkipSelf} from 'ng-metadata/core';

@Directive({selector:'[validator]'})
class ValidatorDirective{
  constructor(@Inject('ngModel') @Host() @SkipSelf() private ngModel: ng.INgModelController){
    // here ngModel is undefined
  }
  ngOnInit(){    
      // this is called from preLink, so controllers have been already instantiated
      this.ngModel.$validators.foo = (viewValue)=>{  /*...*/ }
  }
}

// behind the scenes this creates just

const ddo = { require: ['validator','^^ngModel'] };
// we always require itself on first place, and after are injected directives
```

###### Behind the Scenes

just adds `^^` sign prefix to `require`d directive on host ( default `^` is removed )


## @Injectable

> **module:** `ng-metadata/core`

A decorator that marks a class as injectable. It can then be injected into other annotated classes via the `@Inject` decorator.
This decorator is mandatory for all services because we are creating string name from DI manually

_Example:_

```typescript
import { Injectable, Inject } from 'ng-metadata/core';

@Injectable()
class MyService {
  getData() {}
}

@Injectable()
class GoodService {
  getData() {}
}

@Injectable()
class MyOtherService {

  data: any;
  
  constructor(
    @Inject(MyService) myService: MyService,
    @Inject(GoodService) goodService: GoodService
  ) {
    this.data = myService.getData();
  }
}

// test.ts
import * as angular from 'angular';
import {expect} from 'chai';
import {getInjectableName} from 'ng-metadata/core';

const $injector = angular.injector(['ng','myApp']);

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


## OnInit

> **module:** `ng-metadata/core`

Implement this interface to execute custom initialization logic after your directive's
data-bound properties have been initialized ann after all the controllers on an element have been constructed and had their bindings initialized.

`ngOnInit` is called right after the directive's data-bound properties have been checked for the
first time, and before any of its children have been checked. 
It is invoked only once when the directive is instantiated. 

In angular 1 terms, this method is invoked from `preLink` 

_Example:_

```typescript
```

###### Members

- `ngOnInit()`


## AfterViewInit

> **module:** `ng-metadata/core`

Use this hook only with `@Component()`

Implement this interface to get notified when your component's view and content is fully initialized.

`ngAfterViewInit` is called after all component's content children and view children have been resolved and rendered. 

It is invoked every time when the directive is instantiated. 

In angular 1 terms, this method is invoked from `postLink`

_Example:_

```typescript
```

###### Members

- `ngAfterViewInit()`


## AfterContentInit

> **module:** `ng-metadata/core`

Use this only with `@Directive()`

Implement this interface to get notified when your directive's content fully initialized.

`ngAfterContentInit` is called after all directive's content children have been resolved and rendered. 

It is invoked every time when the directive is instantiated. 

In angular 1 terms, this method is invoked from `postLink`

_Example:_

```typescript
```

###### Members

- `ngAfterContentInit()`


## OnDestroy

> **module:** `ng-metadata/core`

Implement this interface to get notified when your directive is destroyed.

`ngOnDestroy` callback is typically used for any custom cleanup that needs to occur when the
instance(directive) is destroyed.

In anglualr 1 terms, it's invoked when `$scope.$destroy()` is called.

_Example:_

```typescript
```

###### Members

- `ngOnDestroy()`


## Angular 1 specific API's

### compile

Angular 1 directive definition object supports `compile` function for manipulating DOM
and other low level stuff before the directive/component is linked to the scope and re-rendered to DOM.

We provide this functionality by creating `static compile(tElement,tAttrs)` on your Directive/Component your class.

**Note:**
> You cannot inject anything from `$injector`
> Compile can return a link object or directly postLink function, but beware to do this!
> If you return link object/postLink fn, all logic that you've created by for example `@HostListener` decorators 
and life cycle hooks will be discarted and you have to do it on your own, 
so for those reason it is really not advised to return a function from compile method.  

_Example:_

```typescript
import {Directive} from 'ng-metadata/core';

@Directive({selector:'[dom-modify]'})
class DomModfify{
 static compile(tElement: ng.IAugmentedJQuery, tAttrs: ng.IAtrributes){
   // your logic
 } 
}
```

###### [Parameters](https://docs.angularjs.org/api/ng/service/$compile#-compile-)

### link

Angular 1 directive definition object supports `link` property on DDO for handling logic within your directives.

We provide this functionality by creating `static link(scope,element,attrs,controllers,translcude)` on your Directive/Component your class.

**Note:**
> You cannot inject anything from `$injector`
> As mentioned above in `compile` if, you define link this way, it will override all previosly defined behavior,
so yeah try to avoid this, you can do all postLink stuf within your life cycle hook `ngAfterViewInit` or `ngAfterContentInit`

_Example:_

```typescript
import {Directive} from 'ng-metadata/core';

@Directive({selector:'[custom-link]'})
class CustomLink{
 static link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAtrributes, controller: any, transclude:ng.ITransclusionFn){
   // your logic
 } 
}
```

###### [Parameters](https://docs.angularjs.org/api/ng/service/$compile#-link-)
