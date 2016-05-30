## API

Angular 1 bootstrap:

`ng-metadata/platform`
- [bootstrap](#bootstrap)

`ng-metadata/core`
- [enableProdMode](#enableprodmode)

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
- [EventEmitter](#eventemitter)
- [OpaqueToken](#opaquetoken)

Enums:

`ng-metadata/core`
- [ChangeDetectionStrategy](#changedetectionstrategy)

Injectables:

`ng-metadata/platform`
- [Title](#title)

`ng-metadata/router-deprecated`
- [ROUTER_PRIMARY_COMPONENT](#router_primary_component)
- [RootRouter](#rootrouter)

Local Injectables:

`ng-metadata/core`
- [ChangeDetectorRef](#changedetectorref)

`ng-metadata/router-deprecated`
- [Router](#router)
- [RouteParams](#routeparams)
- [RouteData](#routerdata)

Types:

- Angular 1 Directives: 
`ng-metadata/common`
  - [NgModel](#ngmodel)
  - [NgForm](#ngform)
  - [NgSelect](#ngselect)
  
- Angular 1 Component Router:
`ng-metadata/router-deprecated`
  - [RouteDefinition](#routedefinition)  
  - [RouteConfig](#routeconfig)
  - [Instruction](#instruction)
  - [ComponentInstruction](#componentinstruction)


Decorators:

`ng-metadata/core`
- [@Component](#component)
- [@Directive](#directive)
- [@Input](#input)
- [@Output](#output)
- [@Attr](#output)
- [@HostBinding](#hostbinding)
- [@HostListener](#hostlistener)
- [@ViewChild](#viewchild)
- [@ViewChildren](#viewchildren)
- [@ContentChild](#contentchild)
- [@ContentChildren](#contentchildren)
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
- [OnChanges](#onchanges)
- [DoCheck](#docheck)
- [AfterContentInit](#aftercontentinit)
- [AfterContentChecked](#aftercontentchecked)
- [AfterViewInit](#afterviewtinit)
- [AfterViewChecked](#afterviewchecked)
- [OnDestroy](#ondestroy)

`ng-metadata/router-deprecated`
- [CanActivate](#canactivate)
- [OnActivate](#onactivate)
- [CanReuse](#canreuse)
- [OnReuse](#onreuse)
- [OnDeactivate](#ondeactivate)

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
  .directive( ...provide(App) )
  .name;

bootstrap(AppModule);
```

###### Parameters

| Parameter     | Type                            | Description                               |
| ------------- | ------------------------------- |------------------------------------------ |
| **ngModule**  | `string`                        | angular module name                       |
| **{ element?, **  | `Element` or `string`(selector) | you can provide on which element or selector you want to boot your app. Default element is `document` |
| **, strictDi? }** | `boolean`                   | enable strictdi check, to force explicit $inject annotation for all object registered in angular module (more info in [angular docs](https://docs.angularjs.org/error/$injector/strictdi)). Default value is `true` |

returns `undefined`

###### Behind the Scenes

`angular.bootstrap` is called on the page element that matches the element parameter or by default on `document`. 
This action is invoked inside `angular.element( document ).ready` function. 


## enableProdMode

> **module:** `ng-metadata/core`

Disable Angular's development mode, which turns off debug data information and optimizes $http calls execution.

Behind the scenes we are setting :
- [`$compileProvider.debugInfoEnabled(false);`](https://docs.angularjs.org/guide/production#disabling-debug-data)
- [`$httpProvider.useApplyAsync(true)`](https://docs.angularjs.org/api/ng/provider/$httpProvider#useApplyAsync)


*example:*
```typescript
// app.ts
export const AppModule = angular
  .module('myApp',[])
  .name;
  
// main.ts
import {bootstrap} from 'ng-metadata/platform';
import {enableProdMode} from 'ng-metadata/core';
import {AppModule} from './app';

enableProdMode();

bootstrap( AppModule );
```

###### Parameters
none

returns `undefined`

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

## EventEmitter

> **module:** `ng-metadata/core`

Use by directives and components to emit custom Events via `@Output` binding.
> Under the hood operates under the `&` binding but mitigates the pain of passing `{locals}` to the callback

###### members

| members       | Type                            | Description                                  |
| ------------- | ------------------------------- |--------------------------------------------- |
| **emit**      | `(value: T): void`              | emits defined event to parent with provided value, this value is encapsulated in `$event` from within template |
| **subscribe** | `(next?: Function) : Function`  | abstraction of real observable `subscription`, just works as pubSub and returns dispose callback, Do not use this! |

**Note:**
This is not Rx `Subject`, it's just an abstraction
  
**Note 2:**
Never call emitter instance methods within constructor, because the `&` binding is wrapped within EventEmitter during class instantiation.
Instead use `OnInit` phase which you should use anyway for all startup logic.
- This will be resolved in ngMetadata `2.0` where it will be already emitter instance

**Pure Interface usage:**
- if you don't preffer to assign `@Output` to new EventEmitter, isntead you can use just interface like `@Output() callUser: EventEmitter<UserModel>`
-- this is here for migration reasons from traditional callbacks. 
-- Under the hood we add proper `emit` to angular `&` binding, but preferabble is assigning `new EventEmitter`
-- so this way you can call `@Output() callUser: EventEmitter<UserModel>` later in code like `doSomething(){ this.callUser.emit({name:'martin'}) }`
or traditionaly with confusing angular locals `doSomething(){ this.callUser({user:{name:'martin'}}) }`

*example:*

In the following example, Zippy alternatively emits open and close events when its title gets clicked

```typescript
// app.component.ts
import {Component} from 'ng-metadata/core';

@Component({
  selector:'app',
  template:`<zippy open="$ctrl.onOpen($event)" "$ctrl.onClose($event)"></zippy>`,
  directives: [ZippyComponent]
})
class AppComponent {

  onOpen(zippyVisible: boolean){
    console.log(`zippy visibility is: {zippyVisible}`);
  }
  onClose(zippyVisible: boolean){
    console.log(`zippy visibility is: {zippyVisible}`);
  }
}

// zipy.component.ts
import {Component, Output, EventEmitter} from 'ng-metadata/core';

@Component({
  selector: 'zippy',
  template: `
    <div class="zippy">
      <div ng-click="$ctrl.toggle()">Toggle</div>
      <div ng-hide="!$ctrl.visible">
        <ng-transclude></ng-transclude>
      </div>
    </div>`
})
export class ZippyComponent {
  visible: boolean = true;
  
  @Output() open = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<boolean>();
  
  toggle() {
    this.visible = !this.visible;
    if (this.visible) {
      this.open.emit(this.visible);
    } else {
      this.close.emit(this.visible);
    }
  }
}

// index.ts
import * as angular from 'angular';
import {provide} from 'ng-metadata/core';
import {AppComponent} from './app.component';
import {ZippyComponent} from './zippy.component';

export ngModule = angular.module('myApp',[])
  .directive(...provide(AppComponent))
  .directive(...provide(ZippyComponent))
  .name;
```

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


**Enums:**

## ChangeDetectionStrategy

> **module:** `ng-metadata/core`

Describes within the change detector which strategy will be used the next time change detection is triggered.

It works only with `@Component`s which have bound properties via one way data binding `@Input('<')`.

> Using OnPush is much more convenient than manually declaring ngOnChanges and copying binding values there, so we get immutable data
> Under the hood it just calls angular.copy and assigns that new binding reference value to component property

###### members

| members       | Type                            | Description                                  |
| ------------- | ------------------------------- |--------------------------------------------- |
| **OnPush**    | `enum` | OnPush means that the change detector's mode will be set to CheckOnce during hydration |
| **Default**   | `enum` | This strategy has every component by default for one way data bound properties. Default means that the change detector's mode will be set to CheckAlways during hydration. |

*example:*

```typescript
import { Component, Input, OnChanges, ChangeDetectionStrategy } from 'ng-metadata/core';
import { User } from './user.model';

@Component( {
  selector: 'child',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <input type="text" ng-model="$ctrl.user.name">
    </div>
  `
} )
export class ChildComponent implements OnChanges {

  // without OnPush if we change some property on this object in the parent, it will mutate also within child,
  // because that's how javascript works (Objects are passed reference baby!)
  // => this is not true if the bounded property is a primitive ( again this is how JS works)
  @Input('<') user: User;  

  ngOnChanges( changes ) {  
    if(changes.user){
      // this will execute only when user reference has changed on parent
      console.log(changes.user)  
    }
  }

}
```

---

**Injectables:**

- these services can be injected globally ( standard Angular 1 injectables )


## ROUTER_PRIMARY_COMPONENT
 
> **module** `ng-metadata/router-deprecated`

`OpaqueToken` used to bind the component with the top-level( Root ) `RouteConfig`s for the application.
 
We define the top level Root Component by providing a value for the ROUTER_PRIMARY_COMPONENT token.
 
**NOTE:**
- You must do this to tell Angular 1 downgraded ComponentRouter which comopnent is Root ( this is done automaticaly in Angular 2 because app boots as a Tree ) 
- Unlike Angular 2, we need to provide string names to register the component, so in our case we use `getInjectableName` so we work with references
 
 > Once you register it, you can inject it within your app via `@Inject(ROUTER_PRIMARY_COMPONENT) routerRootComponent`, but don't forget that it's just `string` ( name of rootComponent directive ) under the hood
 > Under the hood the opaque token description is [$routerRootComponent](https://docs.angularjs.org/api/ngComponentRouter/service/$routerRootComponent)
 
```typescript
// index.ts
import * as angular from 'angular';
import { provide, getInjectableName } from 'ng-metadata/core';
import { ROUTER_PRIMARY_COMPONENT } from 'ng-metadata/router-deprecated';

import { AppComponent } from './app.component.ts';

export const AppModule = angular.module( 'app', [ 'ngComponentRouter' ] )
  // Here we have specified that the Root Component is the AppCmponent.
  // We need to get component string name because Angular 1 works with string....
  .value( ...provide( ROUTER_PRIMARY_COMPONENT, { useValue: getInjectableName( AppComponent ) } ) )
  .directive( ...provide( AppComponent ) )
  .name;
  
// main.ts
import { bootstrap } from 'ng-metadata/platform';
import { AppModule } from './app';

bootstrap( AppModule );
```

## RootRouter

> **module** `ng-metadata/router-deprecated`

The singleton instance of the `RootRouter` type, which is associated with the top level `$routerRootComponent`.
[Angular 1 docs](https://docs.angularjs.org/api/ngComponentRouter/service/$routerRootComponent).

Thanks to ng-metadata we can inject it via Type without any strings. 

###### members
> it extends [`Router`](https://github.com/ngParty/ng-metadata/tree/master/src/router-deprecated/router.ts) base class, which has quite huge API.

| members           | Type       | Description                                  |
| ----------------- | ---------- |--------------------------------------------- |
| **registry**  | `RouteRegistry` | The RouteRegistry holds route configurations for each component in an Angular app. It is responsible for creating Instructions from URLs, and generating URLs based on route and parameters. |
| **location**  | `Location`      | window.location                             |
| **commit(instruction: `Instruction`, _skipLocationChange?: `boolean`)**  | `Function` | --- |
| **dispose()**  | `Function` | --- |

*example:*

```typescript
import { Component ,OnInit } from 'ng-metadata/core';
import { RootRouter } from 'ng-metadata/router-deprecated';

@Component( {
  selector: 'crisis-detail',
  template: `....`
} )
export class CrisisDetailComponent implements OnInit {

  constructor(
    // you can Inject rootRouter with Angular 1
    private rootRouter: RootRouter
  ) {}

  ngOnInit() {
    // log whole app router registry
    console.log(this.rootRouter.registry)
  }
}
```

## Title

> **module** `ng-metadata/platform`

A service that can be used to get and set the title of a current HTML document.

Since an Angular 2 application can't be bootstrapped on the entire HTML document (`<html>` tag), 
it is not possible to bind to the text property of the HTMLTitleElement elements (representing the `<title>` tag). 
Instead, this service can be used to set and get the current title value.

> this is not true in terms of Angular 1, but adhering to Angular 2 principles we build cleaner and migration ready codebase

**NOTE:**
you need to import this service and register within root component ( root module in Angular 1 terms )

###### members
> it extends [`Router`](https://github.com/ngParty/ng-metadata/tree/master/src/router-deprecated/router.ts) base class, which has quite huge API.

| members           | Type       | Description                                  |
| ----------------- | ---------- |--------------------------------------------- |
| **setTitle(newTitle:string):void**  | `Function` | Set the title of the current HTML document. |
| **getTitle():string**  | `Function` | Get the title of the current HTML document. |
 
**example:**

> [Live example can be found in Playground](https://github.com/ngParty/ng-metadata/tree/master/playground/app/components/title)

```typescript
// app.component.ts

@Component({
  selector: 'app',
  template: `
  <p>Document title is: {{ $ctrl.title }}</p>
  <p>
    Select a title to set on the current HTML document:
  </p>
  <ul>
    <li><a ng-click="$ctrl.setTitle( 'Good morning!' )">Good morning</a>.</li>
    <li><a ng-click="$ctrl.setTitle( 'Good afternoon!' )">Good afternoon</a>.</li>
    <li><a ng-click="$ctrl.setTitle( 'Good evening!' )">Good evening</a>.</li>
  </ul>
  `
})
export class AppComponent {
  constructor(private titleService: Title ) {}

  get title(): string { return this.titleService.getTitle() }

  setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }
}

// index.ts
import * as angular from 'angular';
import { provide } from 'ng-metadata/core';
import { Title } from 'ng-metadata/platform';

import { AppComponent} from './app';

export AppModule = angular.module('myApp',[])
  // we need to register the service manually
  .service( ...provide( Title ) )
  .directive( ...provide( AppComponent ))
```


---

**Local Injectables:**

- these services can be only injected from Component/Directive
- these are not singletons, every component/directive owns it's own instance of the service

## ChangeDetectorRef

> **module:** `ng-metadata/core`

Can be used for custom change detection controll, which can bring us various performance benefits 

###### members

Note: by change detector, we mean in Angular 1 terms, local component `$scope`

| members           | Type       | Description                                  |
| ----------------- | ---------- |--------------------------------------------- |
| **markForCheck**  | `Function` | Marks all ancestors to be checked. ( calls `$scope.$applyAsync()` ) |
| **detectChanges** | `Function` | Checks the change detector and its children. ( calls `$scope.$digest()` ). This can also be used in combination with `detach` to implement local change detection checks. |
| **detach**        | `Function` | Detaches the change detector from the change detector tree. The detached change detector($scope) will not be checked until it is reattached. |
| **reattach**      | `Function` | Reattach the change detector to the change detector tree |

All of following examples can be seen live in [playground](https://github.com/ngParty/ng-metadata/tree/master/playground/app/components/change-detector/change-detector.component.ts) ( clone project, npm install, npm run playground, open localhost:8080/playground )

*example:*

This example showcases `markForCheck`. We are using window.setInterval which won't notify angular about changes.
With ChangeDetectorRef, we can mitigate this problem pretty easily:

```typescript
import * as angular from 'angular';
import {
  provide,
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  Input
} from 'ng-metadata/core';
import { bootstrap } from 'ng-metadata/platform';

@Component( {
  selector: 'mark-for-check',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `Number of ticks inside child: {{ $ctrl.ticks }}`
} )
export class MarkForCheckComponent implements OnInit {
  @Input() ticks;

  constructor( private ref: ChangeDetectorRef ) {}

  ngOnInit() {
    setInterval( () => {
      this.ticks++;
      // the following is required, otherwise the view and parent component will not be updated
      this.ref.markForCheck();
      // if we call instead detectChanges, only view and children will be updated
      // this.ref.detectChanges();
    }, 1000 );
  }

}

@Component( {
  selector: 'app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    Number of ticks inside parent: {{ $ctrl.numberOfTicks }}
    <mark-for-check ticks="$ctrl.numberOfTicks"></mark-for-check>
  `,
  directives: [ MarkForCheckComponent ]
} )
export class AppComponent {
  numberOfTicks = 0;
}

const AppModule = angular.module('myApp',[])
  .directive(...provide(AppComponent))
  .directive(...provide(MarkForCheckComponent))
  .name;
  
bootstrap(AppModule);
```

*example:*

The following example defines a component with a large list of readonly data.

Imagine the data changes constantly, many times per second. For performance reasons,
we want to check and update the list every five seconds. We can do that by detaching
the component's change detector and doing a local check every five seconds.
   
```typescript
import * as angular from 'angular';
import {
  provide,
  Component,
  Injectable,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from 'ng-metadata/core';
import { bootstrap } from 'ng-metadata/platform';

@Injectable()
export class DataProvider {
  private _data = [ 1, 2, 3 ];
  private _interval;

  constructor(){
    setInterval(()=>{
      this._data = [...this._data,...this._data.slice(-2).map(num=>num*2)];
    },3000);
  }
  // in a real application the returned data will be different every time
  get data() {
    return this._data;
  }

}

@Component( {
  selector: 'detach',
  template: `
    <li ng-repeat="d in $ctrl.dataProvider.data track by $index">Data {{d}}</li>
  `
} )
export class DetachComponent {
  constructor( private ref: ChangeDetectorRef, private dataProvider: DataProvider ) {
    ref.detach();
    setInterval( () => {
      this.ref.detectChanges();
    }, 5000 );
  }
}

@Component( {
  selector: 'app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `   
   <detach></detach>
  `,
  providers: [ DataProvider ],
  directives: [ DetachComponent ]
} )
export class AppComponent {}

const AppModule = angular.module('myApp',[])
  .directive(...provide(AppComponent))
  .directive(...provide(DetachComponent))
  .service(...provide(DataProvider))
  .name;
  
bootstrap(AppModule);
```

*example:*

The following example creates a component displaying `live` data. The component will detach
its change detector from the main change detector tree when the component's live property
is set to false.

```typescript
import * as angular from 'angular';
import {
  provide,
  Component,
  Injectable,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from 'ng-metadata/core';
import { bootstrap } from 'ng-metadata/platform';

@Injectable()
export class DataProvider {
  data = 1;

  constructor() {
    setInterval( () => {
      this.data = this.data * 2;
    }, 2500 );
  }
}

@Component( {
  selector: 'reattach',
  template: `Data: {{$ctrl.dataProvider.data}}`
} )
export class ReattachComponent implements OnChanges {

  @Input( '<' ) live: boolean;

  constructor( private ref: ChangeDetectorRef, private dataProvider: DataProvider ) {}

  ngOnChanges( changes ) {
    const liveChange = changes.live as SimpleChange;
    if ( liveChange ) {
      if ( liveChange.currentValue ) {
        this.ref.reattach();
      } else {
        this.ref.detach();
      }
    }
  }

}

@Component( {
  selector: 'app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `   
    Live Update: <input type="checkbox" ng-model="$ctrl.live">
    <reattach live="$ctrl.live"></reattach>
  `,
  providers: [ DataProvider ],
  directives: [ ReattachComponent ]
} )
export class AppComponent {
  live = true;
}

const AppModule = angular.module('myApp',[])
  .directive(...provide(AppComponent))
  .directive(...provide(ReattachComponent))
  .service(...provide(DataProvider))
  .name;
  
bootstrap(AppModule);
```


## Router

> **module** `ng-metadata/router-deprecated`

A Router is responsible for mapping URLs to components.
[Angular 1 docs](https://docs.angularjs.org/api/ngComponentRouter/type/Router).

Each component has its own `Router`. 

**NOTE:**
> Unlike in Angular 2, we cannot use the dependency injector to get hold of a component's Router !!!
 
We can only inject the `RootRouter`. Instead we use the fact that the `ng-outlet` directive binds the current router to a `$router` attribute on our component.

So we can "inject it" via `@Input('<') $router: ChildRouter` binding to our component class.
The binding is available once the component has been activated, and the `$routerOnActivate` hook is called.

It is highly recommeded to use this local `Router` for imperative navigation handling via `navigate()` and related methods

###### members
> it has quite huge API: [`Router`](https://github.com/ngParty/ng-metadata/tree/master/src/router-deprecated/router.ts).

| members           | Type       | Description                                  |
| ----------------- | ---------- |--------------------------------------------- |
| **navigating**  | `boolean` | You can see the state of a router by inspecting the read-only field router.navigating. This may be useful for showing a spinner, for instance. |
| **parent**  | `Router` | direct parent router on parent component if any. For `RootRoute` this is always `null` |
| **hostComponent** | `any` | hostComponent ( within angular 1 it's always string name of that component |
| **navigate( linkParams: any[] ): ng.IPromise<any>** | `Function` | Navigate based on the provided Route Link DSL. It's preferred to navigate with this method over `navigateByUrl`|
| **navigateByUrl( url: string, _skipLocationChange?: boolean ): ng.IPromise<any>** | `Function` | Navigate to a URL. Returns a promise that resolves when navigation is complete. It's preferred to navigate with `navigate` instead of this method, since URLs are more brittle.|
| **navigateByInstruction( instruction: Instruction, _skipLocationChange?: boolean ): ng.IPromise<any>** | `Function` | Navigate via the provided instruction. Returns a promise that resolves when navigation is complete|
| **generate( linkParams: any[] ): Instruction** | `Function` | Generate an `Instruction` based on the provided Route Link DSL. |
  
**example**

```typescript
import { Component } from 'ng-metadata/core';
import { ChildRouter } from 'ng-metadata/router-deprecated';

@Component({
  selector: 'crisis-detail',
  template: `
  <div>
    <md-spinner ng-if="$ctrl.navigationInProggess"></md-spinner>
  </div>`
})
export class CrisisDetailComponent implements OnInit, OnActivate, CanDeactivate {

  @Input( '<' ) $router: ChildRouter;
  
  get navigationInProggess(): boolean { return this.$router.navigating }
  
  gotoCrisis() {
    this.$router.navigate(['HeroList']);
  }

  // Generate an Instruction for a route and navigate directly with this instruction.  
  navigateViaInstruction(){
    const instruction = this.$router.generate(['HeroList']);
    this.$router.navigateByInstruction(instruction);
  }
  
  // this is discouraged because it couples the code of your component to the router URLs.
  manuallyCreateURLandNavigate(){
    this.$router.navigateByUrl('you/mama/is/fat');
  }    
  
}
```



## RouteParams

> **module** `ng-metadata/router-deprecated`

A map of parameters for a given route, passed as part of the `ComponentInstruction` to the Lifecycle Hooks, 
such as `$routerOnActivate` and `$routerOnDeactivate`

**NOTE:**
> Unlike in Angular 2, we cannot use the dependency injector to get hold of a component's RouterParams !!!

We obtain `RouteParams` via Lifecycle Hooks:

**example:**

```typescript
import { Component, OnInit } from 'ng-metadata/core';
import { ComponentInstruction, OnActivate } from 'ng-metadata/router-deprecated';

// we need to tell explicitly to typescript which keys should our route have
type CustomRouteParams = {
  [key: string]: string;
  id: string;
}

@Component( {
  selector: 'hero-detail',
  template: `
    <div ng-if="$ctrl.hero">     
      <button ng-click="$ctrl.gotoHeroes()">Back</button>
    </div>
  `
} )
export class HeroDetailComponent implements OnInit, OnActivate {

  @Input( '<' ) $router: Router;
  hero: Hero = null;

  constructor( private heroService: HeroService ) { }

  $routerOnActivate( next: ComponentInstruction ): void {
    // set routeParams with proper type annotation
    const routeParams = next.params as CustomRouteParams;
    // Get the hero identified by the route parameter
    const id = routeParams.id;
    
    this.heroService.getHero( id ).then( ( hero ) => {
      this.hero = hero;
    } );
  }

  gotoHeroes() {
    const heroId = this.hero && this.hero.id;
    this.$router.navigate( [ 'HeroList', { id: heroId } ] );
  }

  ngOnInit() { }

}
```


## RouteData

> **module** `ng-metadata/router-deprecated`

An immutable map of additional data you can configure in your Route, passed as part of the `ComponentInstruction` to the Lifecycle Hooks, 
such as `$routerOnActivate` and `$routerOnDeactivate`

**NOTE:**
> Unlike in Angular 2, we cannot use the dependency injector to get hold of a component's RouterData !!!

We obtain `RouteParams` via Lifecycle Hooks:

**example:**

```typescript
import { Component, OnInit } from 'ng-metadata/core';
import { ComponentInstruction, OnActivate, RouterData } from 'ng-metadata/router-deprecated';

// we need to tell explicitly to typescript which keys should our routeData have
type CustomRouteData = {
  [key: string]: string;
  foo: string;
}

@Component( {
  selector: 'hero-detail',
  template: `
    <div ng-if="$ctrl.hero">     
      <button ng-click="$ctrl.gotoHeroes()">Back</button>
    </div>
  `
} )
export class HeroDetailComponent implements OnInit, OnActivate {

  constructor( private heroService: HeroService ) { }

  $routerOnActivate( next: ComponentInstruction ): void {
    // set routeParams with proper type annotation
    const routeData = next.routeData;
    const cutomRouteData = routeData.data as CustomRouteData;
    // Get some data
    const foo = routeData.foo;
    
    console.log('data aquired!:', foo );
    
  }

  ngOnInit() { }

}
```

---

### Types

**Angular 1 Directives:**

- we are providing angular directives as angular 2 like directives with proper types 
- you can leverage these for DI

## NgModel

> **module:** `ng-metadata/common`

[angular 1 docs](https://docs.angularjs.org/api/ng/type/ngModel.NgModelController) 

*example:*

```typescript
// app.ts
import * as angular from 'angular';
import {provide} from 'ng-metadata/core';
import {MyValidatorDirective} from './validator.directive';


angular.module('myApp',[])
  .directive(...provide(MyValidatorDirective));

// validator.directive.ts
import {Directive, OnInit} from 'ng-metadata/core';
import {NgModel} from 'ng-metadata/common';

@Directive({selector:'[my-validator]'})
export class MyValidatorDirective implements OnInit{
  // here we are injecting via Type! cool eh?
  constructor(private ngModel: NgModel){}
  ngOnInit(){
    this.ngModel.$validators.myCustomOne = (modelValue, viewValue) => { /* your validation logic */}
  }
}
```

## NgForm

> **module:** `ng-metadata/common`

[angular 1 docs](https://docs.angularjs.org/api/ng/type/form.FormController)

*example:*

```typescript
// app.ts
import * as angular from 'angular';
import {provide} from 'ng-metadata/core';
import {MyFormHandlerDirective} from './form-handler.directive';


angular.module('myApp',[])
  .directive(...provide(MyFormHandlerDirective));

// ./form-handler.directive.ts
import {Directive} from 'ng-metadata/core';
import {NgForm, NgModel} from 'ng-metadata/common';

@Directive({selector:'[my-form-handler]'})
export class MyFormHandlerDirective{
  // here we are injecting via Type! cool eh?
  constructor(private form: NgForm){}
  
  addCustomCntrol(someNgModel:NgModel){
    this.form.$addControl(someNgModel);
  }
}
```
 
## NgSelect

> **module:** `ng-metadata/common`

[angular 1 docs](https://docs.angularjs.org/api/ng/type/select.SelectController)



**Angular 1 Component Router**

> **module:** `ng-metadata/router-deprecated`

## RouteDefinition

Each item in the RouteConfig for a Routing Component is an instance of this type ( Object ). It can have the following properties:

- `path` or (regex and serializer) - defines how to recognize and generate this route (`string`)
- `component` | `loader` | `redirectTo` (requires exactly one of these) (camelCase - angular directive name `string`)
- `name` - the name used to identify the Route Definition when generating links (CapitalCase `string`)
- `useAsDefault` - (`boolean`)  indicates that if no other Route Definition matches the URL, then this Route Definition should be used by default.
- `data` (optional) `any`

## RouteConfig

- array of `RouteDefinition`
- declare it within `@Component` `legacy` property via `$routeConfig` key
- don't worry, Component definition are strictly typed so if you will make a typo there or provide wrong type for your route definition Typescript will tell you

**example**
```typescript
import { Component } from 'ng-metadata/core';

@Component( {
  selector: 'heroes',
  providers: [ HeroService ],
  template: `<h2>Heroes</h2><ng-outlet></ng-outlet>`,
  legacy: {
    $routeConfig: [
      { path: '/', name: 'HeroList', component: 'heroList', useAsDefault: true },
      { path: '/:id', name: 'HeroDetail', component: 'heroDetail' }
    ]
  }
} )
export class HeroesComponent {}
```

## Instruction

Instruction is a tree of ComponentInstructions with all the information needed to transition each component in the app to a given route, including all auxiliary routes.

Instructions can be created using Router, and can be used to perform route changes with Router.


## ComponentInstruction

A ComponentInstruction represents the route state for a single component.

ComponentInstructions is a public API. Instances of ComponentInstruction are passed to route lifecycle hooks
You should never construct one yourself with "new." Instead, rely on router's internal recognizer to construct ComponentInstructions.

You should not modify this object. It should be treated as immutable.

###### members

| Parameter     | Type     | Description        |
| ------------- | ---------|------------------- |
| **reuse** | `boolean` |    |
| **urlPath** | `string` |    |
| **urlParams** | `string[]` |  |
| **routeData** | `RouteData` |   |
| **componentType** | `string` |  |
| **terminal** | `boolean` |  |
| **specifity** | `string` |  |
| **params** | `RouteParams` |  |
| **routeName** | `string` |  |
 
 
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
| **changeDetection**  | `ChangeDetectionStrategy` |  Defines the used change detection strategy. When a component is instantiated with one way bindings via inputs `@Input('<')`, we can tell it explicitly how to propagate those bindings. The changeDetection property defines, whether the change detection will be checked every time or only when the component tells it to do so. |
| **attrs?**      | `Array<string>` |  String Array of names which you want to expose in bindToController via attribute `@` binding. *Example:* `attrs: ['foo']` will connect the class property `foo` to the attribute `foo`. You can also rename the attrs, *example* `attr:['foo: theFoo']` connects `foo` to the attribute `the-foo`.  |
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

To listen to global events, a target must be added to the event name ( before the event separated with colon, like this `(target: click)`). 

The target can be:
 - `window`, 
 - `document`
 - `body`

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

Binds to Component via two way binding `=` by default or via one way binding on Directive by default.
Since 1.5 it allows you to bind to an interpolation which was previously handled by `@Attr` via `@Input('@')`

If you wanna use one way binding on Component use `@Input('<') yourProperty`

*Example:*

```typescript
import { Component, Input } from 'ng-metadata/core';

@Component({ ... })
class MenuDropdown {
  @Input() options;
  @Input('<') oneWay;
  @Input('aliasMe') value;
  @Input('@') interpolatedValue: string;
}
```
```html
<menu-dropdown one-way="ctrl.someValue" options="ctrl.options" alias-me="ctrl.foo" interpolated-value="{{ $ctrl.someValToInterpolate }}"></menu-dropdown>
```

###### Parameters

| Parameter        | Type     | Description                               |
| ---------------- | ---------|------------------------------------------ |
| **exposedName**  | `string` | If provided, then it will be the name of the input when setting on the html element. It supports oneWay binding via `<' sign + followed by optional alias |


## @Output

> **module:** `ng-metadata/core`

An alternative and more declarative way to using the `outputs` property on `@Component`/`@Directive`.
Via `@Output` and `EventEmitter` you can emit custom events to parent component

**Deprecated behaviour: (will be removed in 2.0)**
- binds to controller via `&` binding or executes expression on directive via `$scope.$eval`

*Example:*

```typescript
import { Component, Output } from 'ng-metadata/core';

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
<menu-dropdown on-option-select="$ctrl.optionSelected()" on-alias="$ctrl.onFoo()"></menu-dropdown>
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **exposedName**  | `string` | If provided, then it will be the name of the attribute when setting on the html element via angular expression. |


## @Attrs

> **module:** `ng-metadata/core`

**DEPRECATED** will be removed in 2.0. Instead use `@Input('@)`

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

> Or you can attach to global target if you need

```typescript
import { Component, Directive, HostListener } from 'ng-metadata/core';

@Directive({
  selector: '[resize-handler]'
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
  directives: [ResizeHandlerDirective]
})
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **eventName**  | `string` | event name which the host element should listen to, or if used for global target use `target: eventName` where target can be one of `window` | `document` | `body`
| **args?**  | `string[]` | string path which property from $event should be passed to callback method |

###### Behind scenes
manually registers event listeners on host element via `.on(eventName)` and executes provided method within listener callback wrapped with `#scope.$applyAsync()` to notify whole app about possible changes



## @ViewChild

> **module:** `ng-metadata/core`

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
import {Component, Inject, forwardRef, ViewChild} from 'ng-metadata/core';

@Component({
  selector: 'item',
  template: `hello`
})
class ItemComponent{
  constructor(@Inject(forwardRef(()=>MyComponent)) private myCmp){}
}

@Component({
  selector:'my-cmp',
  directives:[ItemComponent],
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

> **module:** `ng-metadata/core`

- property decorator

Similar to [@ViewChild](#viewchild), but querying for all occurrences not just one

*Example:*
```typescript
import {Component, Inject, forwardRef,ViewChildren} from 'ng-metadata/core';

@Component({
  selector: 'item',
  template: `hello`
})
class ItemComponent{
  constructor(@Inject(forwardRef(()=>MyComponent)) private myCmp){}
}

@Component({
  selector:'my-cmp',
  directives:[ItemComponent],
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

> **module:** `ng-metadata/core`

- property decorator

Configures a content query.
Queries component content( html which is projected to `ng-transclude` slot), for only first match
Content queries are set before the `ngAfterContentInit` callback is called.

**Note**
> if you are using ngIf/ngRepeat those instances won't be available during `ngAfterContentInit`
> if you implement this decorator and you wanna get notified about changes, implement `ngAfterContentChecked`
 and also inject this class to queried child

An alternative and more declarative way to using the [query](#query) property on `@Component`/`@Directive`.


*Example:*
```typescript
import {Component, Inject, forwardRef, ContentChild} from 'ng-metadata/core';

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
  directives:[MyComponent,ItemComponent],
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

> **module:** `ng-metadata/core`

- property decorator

Similar to [@ContentChild](#contentchild), but querying for all ocurrences not just one

*Example:*
```typescript
import {Component, Inject, forwardRef, ContentChildren} from 'ng-metadata/core';

@Component({
  selector: 'item',
  template: `hello`
})
class ItemComponent{
  constructor(@Inject(forwardRef(()=>MyComponent)) private myCmp){}
}

@Component({
  selector:'parent',
  directives:[MyComponent,ItemComponent],
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
    @Inject(FooDirective) @Host() @Optional() private foo: FooDirective
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
import { Inject, Injectable } from 'ng-metadata/core';

Injectable()
class AService{
  constructor(@Inject(BService) private bSvc: BService){}
}

// fileB.ts
import {AService} from './fileA';
import { Inject, Injectable } from 'ng-metadata/core';


Injectable()
class BService{
  constructor(@Inject(AService) private aSvc: AService){}
}
```

This will work thanks to `forwardRef`
```typescript
// index.ts
import {AService} from './fileA';
import {BService} from './fileB';

// fileA.ts
import {BService} from './fileB';
import { Inject, Injectable,forwardRef } from 'ng-metadata/core';

Injectable()
class AService{
  constructor(@Inject(BService) private bSvc: BService){}
}

// fileB.ts
import {AService} from './fileA';
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

It has to be used solely with `@Inject` to notify ngMetadata that we want to inject via local and look for that kind of Directive within DOM

It can be used together with `@Optional` to not throw error when required directive is not found

*example:*

> In the following example, Directive requires ngModel directive solely on itself, so we Inject it

```typescript
import {Directive, Inject, Host} from 'ng-metadata/core';

@Directive({selector:'[validator]'})
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
import {Directive, Inject, Host, Optional} from 'ng-metadata/core';

@Directive({selector:'[validator]'})
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
import {Directive, Inject, Self} from 'ng-metadata/core';

@Directive({selector:'[validator]'})
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
import {Directive, Inject, SkipSelf} from 'ng-metadata/core';

@Directive({selector:'[validator]'})
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


---


**Lifecycle hooks:**


## OnInit

> **module:** `ng-metadata/core`

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

> **module:** `ng-metadata/core`

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
import { bootstrap } from 'ng-metadata/platform';
import { Component, Input, Attr, OnChanges, SimpleChanges, provide } from 'ng-metadata/core';

@Component({
  selector: 'my-cmp',
  template: `
    <p>myProp = {{$ctrl.myProp}}</p>
    <p>myAttr = {{$ctrl.myAttr}}</p>
  `
})
class MyComponent implements OnChanges {
  @Attr() myAttr: string;
  @Input('<') myProp: any;

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
   <my-cmp my-prop="value" my-attr="{{str}}"></my-cmp>
  `,
  directives: [MyComponent]
})
export class App {
  value = 0;
  str = 'hello';
}

const AppModule = angular.module('myApp',[])
  .directive(...provide(MyComponent))
  .directive(...provide(App))
  .name;

bootstrap(AppModule);
```

###### Members

- `ngOnChanges(changes: {[propName: string]: SimpleChange})`



## DoCheck

> **module:** `ng-metadata/core`

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
    <custom-check list="$ctrl.list"></custom-check>`,
   directives: [ CustomCheckComponent ]
 })
 export class AppComponent {
   list = [];
 }
```

###### Members

- `ngDoCheck()`



## AfterViewInit

> **module:** `ng-metadata/core`

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

> **module:** `ng-metadata/core`

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

> **module:** `ng-metadata/core`

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

> **module:** `ng-metadata/core`

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



**Router Lifecycle Hoooks:**

> **module:** `ng-metadata/router-deprecated`

## CanActivate

Defines route lifecycle hook `CanActivate`, which is called by the router to determine if a component can be instantiated as part of a navigation.

**Note:**
> Note that unlike other lifecycle hooks, this one is injectable and needs to be defined as `static method` on component Class, rather than an interface.
> This is because the `$canActivate` function is called before the component is instantiated.

If `$canActivate`:
- returns or resolves to false, the navigation is cancelled. 
- throws or rejects, the navigation is also cancelled
- returns or resolves to true, navigation continues, the component is instantiated, and the `OnActivate` hook of that component is called if implemented.


`$canActivate` hook is Injectable by two injection types:

- Local:
The CanActivate hook is called with two ComponentInstructions as parameters, 
the first representing the current route being navigated to, and the second parameter representing the previous route or null.

Theses locals need be explicitly annoted via:
  - '$nextInstruction'
  - '$prevInstruction' 

- Global:
You can Inject any other service

You can of course mix injecting both local and global

**example:**

```typescript
import { Component, Inject } from 'ng-metadata/core';
import { ComponentInstruction } from 'ng-metadata/router-deprecated';

@Component( {
  selector: 'crisis-list',
  template: `....`
} )
export class CrisisListComponent {

  static $canActivate(
    @Inject( '$nextInstruction' ) $nextInstruction: ComponentInstruction,
    @Inject( '$prevInstruction' ) $prevInstruction: ComponentInstruction,
    @Inject( '$q' ) $q: ng.IQService,
    @Inject( '$timeout' ) $timeout: ng.ITimeoutService
  ): ng.IPromise<boolean> {
    const args = arguments;
    console.info( '$canActivate started!' );
    const promise = $q( ( resolve, reject ) => {
      $timeout( function () {
        resolve( true );
        console.info( '$canActivate with 500ms delay', args );
      }, 500 )
    } );
    return promise;
  }
```


## OnActivate

Defines route lifecycle method `$routerOnActivate`, which is called by the router at the end of a successful route navigation.

For a single component's navigation, only one of either `OnActivate` or `OnReuse` will be called depending on the result of `CanReuse`.

The `$routerOnActivate` hook is called with two ComponentInstructions as parameters, the first representing the current route being navigated to, and the second parameter representing the previous route or null.

If `$routerOnActivate` returns a promise, the route change will wait until the promise settles to instantiate and activate child components.

Implemented component class method signature:

```typescript
$routerOnActivate(
  nextInstruction: ComponentInstruction,
  prevInstruction: ComponentInstruction
): any |ng.IPromise<any>;
```

**Example**

For our HeroList Component we want to load up the list of heroes when the Component is activated. So we implement the `$routerOnActivate()` instance method.
Running the application should update the browser's location to /heroes and display the list of heroes returned from the heroService.

*Important:*
> By returning a promise for the list of heroes from `$routerOnActivate()` **we can delay the activation of the Route until the heroes have arrived successfully**. This is similar to how a resolve works in `ngRoute`.

```typescript
import { Component, OnInit } from 'ng-metadata/core';
import { HeroService, Hero } from './hero.service';

@Component( {
  selector: 'hero-list',
  template: `
    <div ng-repeat="hero in $ctrl.heroes" >
      <a ng-link="['HeroDetail', {id: hero.id}]">{{hero.name}}</a>
    </div>
  `
} )
export class HeroListComponent implements OnInit {

  private selectedId = null;
  heroes: Hero[];

  constructor(private heroService: HeroService) { }

  ngOnInit() { }

  $routerOnActivate( next ): void {
    // Load up the heroes for this view, the component will be loaded after the promise is resolved!
    this.heroService.getHeroes().then( ( heroes ) => {
      this.heroes = heroes;
      this.selectedId = next.params.id;
    } );
  }

}
```

## CanReuse

Defines route lifecycle method `$routerCanReuse`, which is called by the router to determine whether a component should be reused across routes, or whether to destroy and instantiate a new component every time.

The `$routerCanReuse` hook is called with two `ComponentInstructions` as parameters, the first representing the current route being navigated to, and the second parameter representing the previous route.

If `$routerCanReuse`:
- returns or resolves to true, the component instance will be reused and the `OnDeactivate` hook will be run.
- returns or resolves to false, a new component will be instantiated, and the existing component will be deactivated and removed as part of the navigation.
- throws or rejects, the navigation will be cancelled.

Implemented component class method signature:

```typescript
$routerCanReuse(
    nextInstruction: ComponentInstruction,
    prevInstruction: ComponentInstruction
  ): boolean | ng.IPromise<boolean>;
```

## OnReuse

Defines route lifecycle method `$routerOnReuse`, which is called by the router at the **end of a successful route navigation** when `CanReuse` is implemented and returns or resolves to true.

For a single component's navigation, only one of either `OnActivate` or `OnReuse` will be called, depending on the result of `CanReuse`.

The `$routerOnReuse` hook is called with two `ComponentInstructions` as parameters, the first representing the current route being navigated to, and the second parameter representing the previous route or null.

Implemented component class method signature:

```typescript
$routerOnReuse(
    nextInstruction: ComponentInstruction,
    prevInstruction: ComponentInstruction
  ): any | ng.IPromise<any>;
```

## CanDeactivate

Defines route lifecycle method `$routerCanDeactivate`, which is called by the router to determine if a component can be removed as part of a navigation.

The `$routerCanDeactivate` hook is called with two `ComponentInstructions` as parameters, the first representing the current route being navigated to, and the second parameter representing the previous route.

If `$routerCanDeactivate`:
- returns or resolves to false, the navigation is cancelled. If it returns or resolves to true, then the navigation continues, and the component will be deactivated (the OnDeactivate hook will be run) and removed.
- throws or rejects, the navigation is also cancelled.

Implemented component class method signature:

```typescript
$routerCanDeactivate(
  nextInstruction: ComponentInstruction,
  prevInstruction: ComponentInstruction
): boolean | ng.IPromise<boolean>;
```

## OnDeactivate

Defines route lifecycle method `$routerOnDeactivate`, which is called by the router before destroying a component as part of a route change.

The `$routerOnDeactivate` hook is called with two ComponentInstructions as parameters, the first representing the current route being navigated to, and the second parameter representing the previous route.

If `$routerOnDeactivate` returns a promise, the route change will wait until the promise settles.

Implemented component class method signature:

```typescript
$routerCanDeactivate(
  nextInstruction: ComponentInstruction,
  prevInstruction: ComponentInstruction
): boolean | ng.IPromise<boolean>;
```


---


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
