## API

Angular 1 boostraper:

`ng-metadata/platform`
- [bootstrap](#bootstrap)

Angular 1 container registration helper Methods:

`ng-metadata/core` 
- [provide](#provide)
- [getInjectableName](#getinjectablename)

Testing helpers:

`ng-metadata/testing`
- [renderFactory](#renderfactory)
- [getInput](#getinput)

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


## bootstrap `ng-metadata/platform`

Used to bootstrap your application manually after DOMContentLoaded is fired. Do **not** use the `ng-app` directive.

*Example:*

```ts
import { bootstrap, provide, makeDirective, Component } from 'ng-metadata/core';

@Component({ selector: 'app', template: 'Hello World!' })
class App { }

const AppModule = angular.module('app', [])
  .directive(provide(App), makeDirective(App));

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

## provide `ng-metadata/core`

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

```ts
import * as angular from 'angular';
import {provide, Component} from 'ng-metadat/core';

@Component({selector:'hero-cmp',template:`<div>hello hero</div>`})
class HeroCmp{}

angular.module('hero',[])
  .directive( ...provide(HeroCmp) );
```

will register as `angular.directive('heroCmp', function directiveFactory(){ return {} })`.  


> For Services which has @Injectable, by default, it will extract the generated `id` token

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

*example*
```typescript
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

*example*
```typescript
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


## getInjectableName `ng-metadata/core`

A utility function that can be used to get the angular 1 injectable's name. Needed for some cases, since
injectable names are auto-created.

Works for string/OpaqueToken/Type
Note: Type must be decorated otherwise it throws
 
*example:*

```typescript
import { Injectable, getInjectableName } from 'ng-metadata/core';
// this is given some random name like 'myService48' when it's created with `module.service`
 
@Injectable
class MyService {}
 
console.log(getInjectableName(MyService)); // 'myService48'
```


## renderFactory `ng-metadata/testing`

Helper for compiling Component/Directive classes within you unit test.
Use pattern shown in example:
  - create local render variable with interface IRender to tell tsc what type it would be
  - init it when you got $scope and $compile in beforeEach
  - use it within the test
    - if you want to override the inferred type from Directive argument use that via `<>` operator

*Example:*

```typescript
// my-component.ts
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
    
    expect(ctrl instanceOf MyComponent).to.equal(true);
    expect(compiledElement[0]).to.equal('<my-component ng-model="model">hello Martin!</my-component>');
  })
  
})

```

###### Parameters

| Parameter     | Type                            | Description                               |
| ------------- | ------------------------------- |------------------------------------------ |
| **$compile**  | `ng.ICompileService`            | core angular 1 $compile service from ng.mock |
| **$scope**    | `ng.IScope`                     | child scope for your component |

returns render `Function`

###### Behind the Scenes

it builds whole DOM for component/directive, so you don't need to bother with html strings in your test.
Within it calls angular 1 well known $compile with provided $scope and re runs $digest loop to reflect the changes. 


## @Component

A decorator for adding component metadata to a class. 
Components are essentially angular 1 directives with both a template, controller and isolate scope. 
If you are looking to only modify the host element in some way, you should use @Directive.

*Example:*

```ts
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
| **attrs?**  | `Array<string>` |  An array of strings naming what class properties you want to expose in bindToController via attribute `@` binding. For example, `attrs: ['foo']` will connect the class property foo to the attribute foo. You can also rename the attrs, for example `attrs: ['foo:theFoo']` will connect the class property foo to the attribute the-foo.  |
| **inputs?**  | `Array<string>` |  same as `attrs` but binds via `=` two way binding to bindToController  |
| **outputs?**  | `Array<string>` |  same as `attrs` but binds via `&` expression binding to bindToController |
| **legacy?**  | `Object<DirectiveDefinitionObject>`  |  striped angular 1 ddo, use it if you wanna use angular 1 specific API  |

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

    
How to require other directives? Angular 2 uses DI for everything and now you can too!
Just inject needed directives via constructor.
Also note that instances of other directives are available only during `ngOnInit` or `ngAfterViewInit` life cycles,
because other controller instances are created during `preLink` or `postLink` 

*example:*

So you used to use require property on your DDO
```
{require: ['ngModel','someFoo']}
```  

now you do it this way:
```typescript
  @Directive({...})
  SomeFooDirective{}
  
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
- `transclude?` By default we use **false**, you can use this to turn off transclusion or to use **element**. [angular 
transclusion](https://docs.angularjs.org/api/ng/service/$compile)
- `priority?`  [angular priority](https://docs.angularjs.org/api/ng/service/$compile)
- `controllerAs?`  The controller name used in the template. By default we uses **$ctrl**

> There is a better sugar for using attrs/inputs/outputs via property decorators `@Attr`,`@Input`,`@Output`


## @Directive

A decorator for adding directive metadata to a class. 
Directives differ from Components in that they don't have templates; they only modify the host element or add behaviour to it.

*Example:*

```ts
import { Inject, AfterContentInit } from 'ng-metadata/core';

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
| **attrs?**  | `Array<string>` |  An array of strings naming what class properties you want to expose in bindToController via attribute `@` binding. For example, `attrs: ['foo']` will connect the class property foo to the attribute foo. You can also rename the attrs, for example `attrs: ['foo:theFoo']` will connect the class property foo to the attribute the-foo.  |
| **inputs?**  | `Array<string>` |  same as `attrs` but binds via `=` two way binding to bindToController  |
| **outputs?**  | `Array<string>` |  same as `attrs` but binds via `&` expression binding to bindToController |
| **legacy?**  | `Object<DirectiveDefinitionObject>`  |  striped angular 1 ddo, use it if you wanna use angular 1 specific API  |

Note:
- It is best to exec all logic within `ngAfterContentInit` method, because we are 100% sure, that host and children DOM is ready ( compiled ) 


## @Input

An alternative and more declarative way to using the `inputs` property on `@Component`/`@Directive`.

Binds to controller via `=` binding or gets expression on directive via `$scope.$watch`

*Example:*

```ts
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

An alternative and more declarative way to using the `outputs` property on `@Component`/`@Directive`.

Binds to controller via `&` binding or executes expression on directive via `$scope.$eval`

*Example:*

```ts
@Component({ ... })
class MenuDropdown {
    @Output() onOptionSelect: Function;
    @Output('onAlias') onFoo: Function;

    someMethod() {
        this.optionSelect();
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

An alternative and more declarative way to using the `attrs` property on `@Component`/`@Directive`.

Binds to controller via `@` binding or observes attirbute on directive via `$attrs.observe` and sets $ctrl instance 
value

*Example:*

```ts
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


## @Pipe

A decorator for adding pipe metadata to a class. Pipes are essentially the same as angular 1 filters.

*Example:*

```ts
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

A parameter decorator that declares the dependencies to be injected in to the class' constructor, static or regular method.

*Example:*

```ts
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

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **injectables**  | `string` or `class` | use string for angular 1 and 3rd party module injectables, use class reference for custom ones |

Note:
- If string, then it's considered a core angular service such as $q or $http. It could also be a special 'local', for example component's can inject $element, $attrs or $scope
- If class, then it's considered to be a custom class(service)

###### Behind the Scenes

The injectables are added to the $inject property of the class constructor function.


## @Injectable

A decorator that marks a class as injectable. It can then be injected into other annotated classes via the `@Inject` decorator.
This decorator is mandatory for all services because se are creating string from DI manually

_Example:_

```ts
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
  constructor(
    @Inject(MyService) myService: MyService,
    @Inject(GoodService) goodService: GoodService
  ) {
    this.data = myService.getData();
  }
}

expect($injector.get('myService') instanceOf MyService).to.equal(true)
expect($injector.get('fooSvc') instanceOf GoodService).to.equal(true)
expect($injector.get('myOtherService') instanceOf MyOtherService).to.equal(true)
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |

###### Behind the scenes:

We internally create unique name string token on InjectableMetadata, from class.name or we stringify it to get the 
name if JS engine doesn't implements ES6 name property


## OnInit

Implement this interface to execute custom initialization logic after your directive's
data-bound properties have been initialized.

`ngOnInit` is called right after the directive's data-bound properties have been checked for the
first time, and before any of its children have been checked. 
It is invoked only once when the directive is instantiated. 

In angular 1 terms, this method is invoked from `preLink` 

_Example:_

```ts
```

###### Members

- `ngOnInit()`


## AfterContentInit

Use this with `@Component()`

Implement this interface to get notified when your component's view and content is fully initialized.

`ngAfterViewInit` is called after all component's content children and view children have been resolved and rendered. 

It is invoked every time when the directive is instantiated. 

In angular 1 terms, this method is invoked from `postLink`

_Example:_

```ts
```

###### Members

- `ngAfterViewInit()`


## AfterContentInit

Use this with `@Directive()`

Implement this interface to get notified when your directive's content fully initialized.

`ngAfterContentInit` is called after all directive's content children have been resolved and rendered. 

It is invoked every time when the directive is instantiated. 

In angular 1 terms, this method is invoked from `postLink`

_Example:_

```ts
```

###### Members

- `ngAfterContentInit()`


## OnDestroy

Implement this interface to get notified when your directive is destroyed.

`ngOnDestroy` callback is typically used for any custom cleanup that needs to occur when the
instance(directive) is destroyed.

In anglualr 1 terms, it's invoked when `$scope.$destroy()` is called.

_Example:_

```ts
```

###### Members

- `ngOnDestroy()`
