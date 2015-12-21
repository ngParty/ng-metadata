# ng-metadata

[![Build Status](https://travis-ci.org/ngParty/ng-metadata.svg)](https://travis-ci.org/ngParty/ng-metadata)
[![Dependencies Status](https://david-dm.org/ngParty/ng-metadata.svg)](https://david-dm.org/ngParty/ng-metadata)
[![devDependency Status](https://david-dm.org/ngParty/ng-metadata/dev-status.svg)](https://david-dm.org/ngParty/ng-metadata#info=devDependencies)
[![npm](https://img.shields.io/npm/v/ng-metadata.svg)](https://www.npmjs.com/package/ng-metadata)
[![GitHub tag](https://img.shields.io/github/tag/ngParty/ng-metadata.svg)]()
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/ngParty/ng-metadata/master/LICENSE)

> Angular 2 style decorators for Angular 1.x

**ng-metadata** this is a viable solution for people,
who want to update **existing** ng1 codebases, with Typescript and using Angular 2 conventions and styles that runs today on Angular 1.3+.

**TL;DR**

It leads you, to to write **clean and component driven** style code.

Behind the scenes it uses ES7 decorators extended by Typescript( which add to the proposal parameter decorators etc...)

![ng-metadata logo](assets/logo/ng-metadata_logo.png)

## Installation

`npm i --save ng-metadata@beta`

You have to allow nodeJs module resolution style in your `tsconfig.json`

```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

That's it! Now just start importing from `ng-metadata/ng-metadata`

> It is also recommended to install angular 1 type definitions, so you get Angular 1 API type checking,
 via [typings](https://github.com/typings/typings) or [tsd](https://github.com/Definitelytyped/tsd)

## Why

There is already an existing project, which gives us Angular 2 like syntax for Angular 1, [ng-forward](https://github.com/ngUpgraders/ng-forward)

With all do respect, ng-forward is an overkill IMHO, for existing ng1 apps, so this is why I made **ng-metadata**.

ng-metadata can be used as part of an upgrade strategy, which may also include *ng-upgrade*, when migrating to Angular 2.

## API

Angular 1 container registration helper Methods:

- [bootstrap](#bootstrap)
- [provide](#provide)
- [makeDirective](#makedirective)
- [makePipe](#makepipe)

Decorators(core):

- [@Component](#component)
- [@Directive](#directive)
- [@Input](#input)
- [@Output](#output)
- [@Attr](#output)
- [@Pipe](#pipe)
- [@Inject](#inject)
- [@Injectable](#injectable)

Lifecycle hooks:

- [OnInit](#oninit)
- [AfterContentInit](#aftercontentinit)
- [OnDestroy](#ondestroy)


## bootstrap

Used to bootstrap your application manually after DOMContentLoaded is fired. Do **not** use the `ng-app` directive.

*Example:*

```ts
import { bootstrap, provide, makeDirective, Component } from 'ng-metadata/ng-metadata';

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



## provide

Extracts and returns `name` from provided argument so we don't have to use strings.
It's smart ( it knows if argument is Component or Directive or Pipe or Service ).

Has to be used with these `angular.*` registrator methods as first argument:
- `directive`
- `filter`
- `service` 

*Example:*

this:

```ts
import * as angular from 'angular';
import {provide, makeDirective, Component} from 'ng-metadat/ng-metadata';

@Component({selector:'hero-cmp',template:`<div>hello hero</div>`})
class HeroCmp{}

angular.module('hero',[])
  .directive(provide(HeroCmp), makeDirective(HeroCmp));
```

will register as `angular.directive('heroCmp', function directiveFactory(){ return {} })`.  


With services/providers/factories it can be used with optional argument, so we register it with different name then it would be extracted:

```ts
import * as angular from 'angular';
import {provide} from 'ng-metadat/ng-metadata';
import {HeroSvc} from './hero.service';

angular.module('hero', [])
  .service(provide('myHero',{useClass:HeroSvc}), HeroSvc);
```

> For Services, by default, it will extract the class name and return it camelCased

so this:

```ts
import * as angular from 'angular';
import {provide} from 'ng-metadat/ng-metadata';
import {HeroSvc} from './hero.service';

angular.module('hero',[])
  .service(provide(HeroSvc), HeroSvc);
```

will register as `angular.service('heroSvc', HeroSvc)`

###### Parameters

| Parameter         | Type                            | Description                               |
| ----------------- | ------------------------------- |------------------------------------------ |
| **token**         | `class` or `string`             | class reference or string alias token     |
| **provideType?**  | `{useClass: class}`    | This is applicable only for angular `service`,`factory`,`provider` methods |

returns `string` which is registered within angular container.

###### Behind the Scenes

`provide` extract name from various Types, which should be used for registration within angular.* methods.

- for **Component/Directive** it extracts `selector` property and transforms it to camel case
- for **Pipe** it extracts `name` property and transforms it to camel case
- for **Service** it extracts `name` from class property if supported by JS engine, or stringifies function name, and transforms it to camel case
( if useClass used the token overrides default behaviour )



## makeDirective

Creates directiveFactory function from `@Component/@Directive` decorated class, which is used as second argument when 
`angular.directive` called

*Example:*

```ts
import { makeDirective, Component } from 'ng-metadata/ng-metadata';

@Component({ selector: 'app', template: 'Hello World!' })
class App { }

const AppModule = angular.module('app', [])
  .directive(provide(App), makeDirective(App));

```

###### Parameters

| Parameter     | Type                            | Description                               |
| ------------- | ------------------------------- |------------------------------------------ |
| **Type**      | `class`                         |  `@Component/@Directive` class  |

returns `function` - directive factory 

###### Behind the Scenes

`makeDirective` extracts from `Component/Directive` decorated class special `_ddo` property which is directive definition object
and wraps it in a directive factory function 


## makePipe

Creates filterFactory function from `@Pipe` decorated class, which is used as second argument when 
`angular.filter` called

*Example:*

```ts
import { makePipe, Pipe } from 'ng-metadata/ng-metadata';

@Pipe({ name: 'uppercase'})
class UppercasPipe { 
  transform(input: string){
    return input.toUpperCase();
  }
}

const AppModule = angular.module('app', [])
  .filter(provide(UppercasPipe), makePipe(UppercasPipe));

```

###### Parameters

| Parameter     | Type                            | Description                               |
| ------------- | ------------------------------- |------------------------------------------ |
| **Type**      | `class`                         | `@Pipe` class  |

returns `function` - filter factory 

###### Behind the Scenes

`makePipe` extracts from `Pipe` decorated class special `transform` method which has filter logic and wraps it 
within filterFactory function


## @Component

A decorator for adding component metadata to a class. 
Components are essentially angular 1 directives with both a template, controller and isolate scope. 
If you are looking to only modify the host element in some way, you should use @Directive.

*Example:*

```ts
import { makeDirective, Component } from 'ng-metadata/ng-metadata';

@Component({ 
  selector: 'greeter', 
  template: `Hello World!`,
  attrs: ['mood'],
  inputs: ['user'],
  outputs: ['onNameChange'] 
})
class Greeter {}

const AppModule = angular.module('app', [])
  .directive(provide(Greeter), makeDirective(Greeter));
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

- `require?` If the component needs other components/directives(controllers). Syntax is the same as for [angular require](https://docs.angularjs.org/api/ng/service/$compile)
If you use require, your component implements `AfterContentInit` interface which requires `ngAfterContentInit` method to be implemented by your class.
It has one argument: `controllers`: `Array[...ctrls]` which contains all controllers provided by you in *require* property.
  - so if you have `require: ['ngModel','^^someFoo']`, `ngAfterContentInit` controllers argument will be a tuple `[ngModelCtrl, someFooCtrl]`, use destructuring to get those values elegantly.  
```ts
  @Component({ 
    selector:'foo',
    template:`<div>hello</div>`,
    legacy:{
      require: ['ngModel','^^someFoo']
    }
  })
  class Foo implements AfterContentInit{
    ngAfterContentInit(controllers: [ng.INgModelController, SomeFoo]){
      const [ngModel, someFoo] = controllers;
    }
  }
```
- `terminal?` If the compilation should stop here. [angular terminal](https://docs.angularjs.org/api/ng/service/$compile)
- `transclude?` By default we use **true**, you can use this to turn off transclusion or to use **element**. [angular transclusion](https://docs.angularjs.org/api/ng/service/$compile)
- `priority?`  [angular priority](https://docs.angularjs.org/api/ng/service/$compile)
- `controllerAs?`  The controller name used in the template. By default we uses **ctrl**

> There is a better sugar for using attrs/inputs/outputs via property decorators `@Attr`,`@Input`,`@Output`


## @Directive

A decorator for adding directive metadata to a class. 
Directives differ from Components in that they don't have templates; they only modify the host element or add behaviour to it.

*Example:*

```ts
import { makeDirective, Directive, Inject } from 'ng-metadata/ng-metadata';

@Directive({ 
  selector: '[class-adder]'
})
class ClassAdder {
  
   constructor( @Inject('$element') private $element: ng.IAugmentedJQuery) {}
   
   // every directive needs to implement this life cycle method
   afterContentInit(){
     this.$element.addClass('foo');
   }
    
}

const AppModule = angular.module('app', [])
  .directive(provide(ClassAdder), makeDirective(ClassAdder));
```

###### Parameters

| Parameter     | Type     | Description                               |
| ------------- | ---------|------------------------------------------ |
| **selector**  | `string` |  The directive's selector. It must be a css attribute selector, for example '[my-thing]' is valid, but 'my-component' or '.my-class' are invalid. |
| **legacy?**   | `Object<DirectiveDefinitionObject>`  |  striped angular 1 ddo, use it if you wanna use angular 1 specific API  |

Note:
- Directive must implement `ngAfterContentInit` method, even if it doesn't use `legacy.require`, 
because this method is always called from postLink, so we can ensure that everything is compiled when logic of directive is executed.
- It also best practice to execute directive logic when host and children DOM is ready ( compiled )


## @Input

An alternative and more declarative way to using the `inputs` property on `@Component`.

Binds to controller via `=` binding.

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

An alternative and more declarative way to using the `outputs` property on `@Component`.

Binds to controller via `&` binding.

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

An alternative and more declarative way to using the `attrs` property on `@Component`.

Binds to controller via `@` binding.

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
import { Pipe } from 'ng-metadata/ng-metadata';

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
| **pure?**     | `boolean`[true] | If pipe is pure. If we wanna inject some DI we have to change it to false, so the DI is correctly injected via constructor |

Note:
- every Pipe needs to implement `transform` method which contains pipe logic which will be transformed to filter factory


## @Inject

A parameter decorator that declares the dependencies to be injected in to the class' constructor, static or regular method.

*Example:*

```ts
import { Inject, Component } from 'ng-metadata/ng-metadata';
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
Optionally you can provide name, under which it will be registered during angular.service registration ( this prevents JIT name generation )

_Example:_

```ts
import { Injectable, Inject } from 'ng-metadata/ng-metadata';

@Injectable()
class MyService {
  getData() {}
}

@Injectable('fooSvc')
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
| **name?**  | `string` | explicitly provide name for service which will be used during angular registration |

###### Behind the scenes:

it gets name property from provided class if JS engine supports it, else uses stringify on function and extracts
name from there. This string will be camel cased.
If you explicitly provide name parameter, this will be used and saved as `_name` static property.


## OnInit

@TODO - not yet implemented 

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

Implement this interface to get notified when your directive's content and view has been fully initialized.

`ngAfterContentInit` is called after all directive's view or content children hav been resolved and rendered. 

It is invoked every time when the directive is instantiated. 

In angular 1 terms, this method is invoked from `postLink`

_Example:_

```ts
```

###### Members

- `ngAfterContentInit(controllers?: any[])`


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


---


## Design Patterns / Usage

Here we will demonstrate how to migrate from existing code base, to Typescript with ng-metadata.

> We assume that your code is following [John Papa's styleguide](https://github.com/johnpapa/angular-styleguide),
because that's the idiomatic AngularJs style with ES5

> Note that examples for ES5 count's on that you have some build steps that concatenates your js files, because ES5 doesn't has module system

How it all works behind the scenes can be seen in [my Talk](https://t.co/J8qfq1MuOw)


### Component

> component is represented in DOM as a `custom element`,
 which consists from:
 * template
 * controller
 * isolate scope
 * shadow dom ( transclusion )

**ES5**

```js
// hero.component.js

angular.module('hero')
  .directive('hero',heroCmp);

function heroCmp(){
  return {
    scope: {},
    bindToController: {
      name: '=',
      onCall: '&'
    },
    controller: HeroController,
    controllerAs: 'ctrl',
    transclude: true,
    templateUrl: 'hero.html'
  };
}

HeroController.$inject = ['log'];
function HeroController($log){}
```

```js
// hero.js

angular.module('hero',[]);
```

**TS + ng-metadata**

```ts
// hero.component.ts

import {Component,Inject,Input,Output} from 'ng-metadata/ng-metadata';

@Component({
  selector: 'hero',
  templateUrl: 'hero.html'
})
export class HeroCmp{

  @Input() name: string;
  @Output() onCall: Function;

  constructor(@Inject('$log') private $log: ng.ILogService){}

}
```

```ts
// hero.ts

import * as angular from 'angular';
import {provide, makeDirective} from 'ng-metadat/ng-metadata';
import {HeroCmp} from './hero.component';

angular.module('hero',[])
  .directive(provide(HeroCmp), makeDirective(HeroCmp));
```


### Directive

> directive is represented in DOM as a `element attribute`,
 which consists from:
 * controller
 * no scope

> Directive should be used only for behavioral/extension purposes

**ES5**

```js
// clicker.directive.js

angular.module('clicker')
  .directive('clickMe',clickMeDirective);

clickMeDirective.$inject = ['$log'];
function clickMeDirective($log){
  return {
    link: function postLink(scope,element,attrs){

      element
        .on('click', function(event){
          $log.info('you have clicked me!');
        });

      scope
        .$on('$destroy', function(){
          element.off('click');
        });

    }
  };
}
```

```js
// clicker.js

angular.module('clicker',[]);
```

**TS + ng-metadata**

```ts
// clicker.directive.ts

import {Directive,Inject, OnDestroy} from 'ng-metadat/ng-metadata';

@Directive({
  selector: '[click-me]'
})
export class ClickMe implements OnDestroy{

  constructor(
    @Inject('$element') private $element: ng.IJQueryAugmented,
    @Inject('$log') private $log: ng.ILogService
  ){

      $element
        .on('click', function(event){
          $log.info('you have clicked me!');
        });

  }

  onDestroy(){
      this.$element.off('click');
  }

}
```

```ts
// clicker.ts

import * as angular from 'angular';
import {provide, makeDirective} from 'ng-metadat/ng-metadata';
import {ClickMe} from './clicker.directive';

angular.module('clicker',[])
  .directive(provide(ClickMe), makeDirective(clickMe));
```


### Pipe

> pipe is represented in DOM as an `pipe operator` on expression.
It's just classic `angular.filter` which needs to implement `#transform` method

**ES5**

```js
// uppercase.filter.js

angular.module('filters')
  .filter('uppercase',uppercase);


function uppercase(){
  return function(input){

    if(typeof input !== 'string'){
      return input;
    }

    return input.toUpperCase();
    
  };
  
}  
```

```js
// uppercase.js

angular.module('filters',[]);
```

**TS + ng-metadata**

```ts
// uppercase.filter.ts

import {Pipe} from 'ng-metadata/ng-metadata';

@Pipe({
  name:'uppercase'
})
export class UppercasePipe{

  transform(input: string): string|any {

    if(typeof input !== 'string'){
      return input;
    }

    return input.toUpperCase();
  }

}
```

```ts
// uppercase.ts

import * as angular from 'angular';
import {provide, makePipe} from 'ng-metadat/ng-metadata';
import {UppercasePipe} from './uppercase.filter';

angular.module('filters',[])
  .filter(provide(UppercasePipe), makePipe(UppercasePipe));
```


### Service

> service is just pure `ES6 class` registered with`angular.service`.

**ES5**

```js
// user.service.js

angular.module('user')
  .service('userSvc',User);

User.$inject = ['$http'];
function User($http){

  this.hobbies = [];
  this.addHobby=function(name){
     this.hobbies.push(name);
  }

  this.getInfo = function(){
    return $http.get('/foo/bar/info')
      .then(function(response){
         return response.data;
      });
  }

}
```

```js
// user.js

angular.module('user',[]);
```


**TS + ng-metadata**

```ts
// user.service.ts

import {Inject} from 'ng-metadata/ng-metadata';

export class UserSvc{

  hobbies: string[] = [];

  constructor( @Inject('$http') private $http: ng.IHttpService ){}

  addHobby(name: string){
     this.hobbies.push(name);
  }

  getInfo(){
    return this.$http.get('/foo/bar/info')
      .then((response)=>response.data);
  }

}
```

```ts
// user.ts

import * as angular from 'angular';
import {provide} from 'ng-metadat/ng-metadata';
import {UserSvc} from './user.service';

angular.module('user',[])
  .service(provide(UserSvc), UserSvc);
```


### Provider

> provider is just pure `ES6 class` registered with`angular.provider` which has `$get` method, which returns new 
instance of service class.

> NOTE: you should use providers sparingly, because they don't exist in angular 2

**ES5**

```js
//droid.provider.js

angular.module('droid')
  .provider('droidSvc', DroidProvider);

var droidName = 'bb-8';

DroidProvider.$inject = ['$logProvider'];
function DroidProvider($logProvider){

  $logProvider.debugEnabled(true);

  this.defaultName = function(name){
    droidName = name;  
  };
  this.$get = $get;
  
  $get.$inject = ['$log'];
  function $get($log){
    return new DroidSvc($log);
  }

}

function DroidSvc($log){

  this.sayHi = function(){
    $log.log(droidName + ' says hello!');
  };
  
}
```

```js
// droid.js

angular.module('droid',[]);
```


**TS + ng-metadata**
```ts
// droid.provider.ts

import {Inject} from 'ng-metadata/ng-metadata';

let droidName = 'bb-8';

export class DroidProvider{

  constructor( @Inject('$logProvider') private $logProvider: ng.ILogProvider ){
    $logProvider.debugEnabled(true);
  }

  defaultName(name: string){
    droidName = name;
  }

  $get(@Inject('$log') $log: ng.ILogService){
    return new DroidSvc($log);
  }

}

// export so we can use it for type annotations
export class DroidSvc{
  
  constructor(private $log: ng.ILogService){}
  
  sayHi(){
    this.$log.log(`${droidName} says hello!`);
  }
  
}
```

```ts
// droid.ts

import * as angular from 'angular';
import {provide} from 'ng-metadat/ng-metadata';
import {DroidProvider} from './droid.provider';

angular.module('droid',[])
  // here we are using angular 2 like syntax registration
  // because we don't want to register the service as 'UserProvider' but as 'userSvc'
  .provider(provide('userSvc', {useClass:UserProvider}), UserSvc);
```


### Startup Logic

#### Run Blocks

> try to not to use `run` api, because there is no equivalent in Angular 2

**ES5**

```js
// app.config.js
angular.module('app')
  .run(runBlock);

runBlock.$inject = ['authenticator', 'translator'];
function runBlock(authenticator, translator) {
    authenticator.initialize();
    translator.initialize();
}
```

```js
// app.js

angular.module('app',[])
```


**TS + ng-metadata**

```ts
// app.config.ts

import {Inject} from 'ng-metadata/ng-metadata';
import {Authenticator, Translator ) from 'some-library';

class RunBlock{

  constructor(
    @Inject('authenticator') private authenticator: Authenticator,
    @Inject('translator') private translator: Translator
  ){
     authenticator.initialize();
     translator.initialize();
  }

}

```

```ts
// app.ts

import * as angular from 'angular';
import {RunBlock} from './app.config';

angular.module('app',[])
  .run(RunBlock);
```


#### Configuration

> try to not to use `config` api, because there is no equivalent in Angular 2
> use it only for routes/states definition

**ES5**

```js
// app.config.js

angular.module('app')
  .config(stateConfig);

stateConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
function stateConfig($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/state1");
  //
  // Now set up the states
  $stateProvider
    .state('state1', {
      url: '/state1',
      template: '<foo-component></foo-component>'
    });

}
```

```js
// app.js

angular.module('app',[])
```

**TS + ng-metadata**

```ts
// app.config.ts

import {Inject} from 'ng-metadata/ng-metadata';

class StateConfig{

  constructor(
    @Inject('$stateProvider') private $stateProvider,
    @Inject('$urlRouterProvider') private $urlRouterProvider
  ){
     //
     // For any unmatched url, redirect to /state1
     $urlRouterProvider.otherwise("/state1");
    //
    // Now set up the states
    $stateProvider
      .state('state1', {
        url: '/state1',
        template: '<foo-component></foo-component>'
      });

  }
}
```

```ts
// app.ts

import * as angular from 'angular';
import 'angular-ui-router';
import {StateConfig} from './app.config';

angular.module('app',[])
  .config(StateConfig);
```
