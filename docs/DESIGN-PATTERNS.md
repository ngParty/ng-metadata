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
    controllerAs: '$ctrl',
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

import {Component,Inject,Input,Output} from 'ng-metadata/core';

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
import {provide} from 'ng-metadata/core';
import {HeroCmp} from './hero.component';

angular.module('hero',[])
  .directive( ...provide(HeroCmp) );
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
      
      var me = attrs['me'];
      
      element
        .on('click', function(event){
          $log.info('you have clicked ' + me);
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

import {Directive,Inject,Input,HostListener} from 'ng-metadata/core';

@Directive({
  selector: '[click-me]'
})
export class ClickMe {

  constructor(
    @Inject('$log') private $log: ng.ILogService
  ) {}
  @Input('@') me: string;
  
  @HostListener('click')
  clickOnHostElement() {
    this.$log.info('you have clicked ' + this.me);
  }

}
```

```ts
// clicker.ts

import * as angular from 'angular';
import {provide} from 'ng-metadata/core';
import {ClickMe} from './clicker.directive';

angular.module('clicker',[])
  .directive( ...provide(ClickMe) );
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

import {Pipe} from 'ng-metadata/core';

@Pipe({
  name:'uppercase'
})
export class UppercasePipe{

  transform(input: string|any): string|any {

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
import {provide} from 'ng-metadata/core';
import {UppercasePipe} from './uppercase.filter';

angular.module('filters',[])
  .filter( ...provide(UppercasePipe) );
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

import {Inject, Injectable} from 'ng-metadata/core';

@Injectable()
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
import {provide} from 'ng-metadata/core';
import {UserSvc} from './user.service';

angular.module('user',[])
  .service( ...provide(UserSvc) );
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

import {Inject} from 'ng-metadata/core';

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
import {provide} from 'ng-metadata/core';
import {DroidProvider} from './droid.provider';

angular.module('droid',[])
  // here we are using angular 2 like syntax registration
  // because we don't want to register the service as 'DroidProvider' but as 'droidSvc'
  .provider( ...provide('droidSvc', {useClass:DroidProvider}) );
```


### Startup Logic

#### Run Blocks

> try to not to use `run` api, because there is no equivalent in Angular 2,
> instead do your initial run logic within service `constructor`

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

**NOTE:** don't use `this` within `RunBlock` class, because angular invokes `.config` function via `Function.apply` so `this` is `undefined`

```ts
// app.config.ts

import {Inject} from 'ng-metadata/core';
import {Authenticator, Translator ) from 'some-library';

export class RunBlock {
  
  static $inject = ['authenticator', 'translator'];
  constructor( authenticator: Authenticator, translator: Translator ) {
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
  // NOTE: RunBlock class is not instantiated, angular will use the constructor as a factory function
  .run(RunBlock); 
```


#### Configuration/Routing

> try to not to use `config` api, because there is no equivalent in Angular 2
> use it only for routes/states definition

**ES5**

```js
// app.states.js

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
// index.js

angular.module('app',['uiRouter'])
```

**TS + ng-metadata**

**NOTE:** don't use `this` within `StateConfig` class, because angular invokes `.config` function via `Function.apply` so `this` is `undefined`
 
```ts
// app.states.ts

export class StateConfig{
  
  // we need to manualy annotate DI
  static $inject = ['$stateProvider', '$urlRouterProvider'];
  constructor( $stateProvider, $urlRouterProvider ){
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/state1");
    
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
// index.ts

import * as angular from 'angular';
import * as uiRouter from 'angular-ui-router';
import {StateConfig} from './app.config';

angular.module('app',[uiRouter])
  // NOTE: StateConfig class is not instantiated, angular will use the constructor as a factory function
  .config(StateConfig); 
```


### Component Router

> **NOTE:** component router works only with Angular >= 1.5 !!!

> [check complete working example](https://github.com/ngParty/Angular1-scaffold/tree/component-router)

install `npm install --save @angular/router@0.2.0`

Include it to your bundle via empty import

```typescript
// /vendor.ts

import 'angular';
// here we are loading ngComponentRouter
import '@angular/router/angular1/angular_1_router';

import 'ng-metadata/platform';
import 'ng-metadata/core';
import 'ng-metadata/common';
// typings and providers for ngComponentRouter
import 'ng-metadata/router-deprecated';
```

Use it within your app like following

```typescript
// /app/app.component.ts

import { Component, OnInit, Inject } from 'ng-metadata/core';

@Component({
  selector: 'app',
  styles: [ require( './app.scss' ) ],
  template: `
    <h1>Hello from Pluto!!!</h1>
    <nav>
      <a ng-link="['CrisisCenter']">Crisis Center</a>
      <a ng-link="['Heroes']">Heroes</a>
    </nav>
    <ng-outlet></ng-outlet>
  `,
  legacy: {
    $routeConfig: [
      { path: '/crisis-center/...', name: 'CrisisCenter', component: 'crisisCenter', useAsDefault: true },
      { path: '/heroes/...', name: 'Heroes', component: 'heroes' }
    ]
  }
})
export class AppComponent implements OnInit {

  constructor( @Inject( '$log' ) private _$log: ng.ILogService ) {}

  ngOnInit() {
    this._$log.log( 'hello from pluto during OnInit' );
  }

}

// /app/index.ts
import * as angular from 'angular';
import { provide, getInjectableName } from 'ng-metadata/core';
import { ROUTER_PRIMARY_COMPONENT } from 'ng-metadata/router-deprecated';

import { AppComponent } from './app.component.ts';

export const AppModule = angular.module( 'app', [
  'ngComponentRouter'
] )
  .value( ...provide( ROUTER_PRIMARY_COMPONENT, { useValue: getInjectableName( AppComponent ) } ) )
  .directive( ...provide( AppComponent ) )
  .name;


// /main.ts
import { bootstrap } from 'ng-metadata/platform';

import { AppModule } from './app';

bootstrap( AppModule );
```
