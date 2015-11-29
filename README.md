# ng-metadata

[![Build Status](https://travis-ci.org/ngParty/ng-metadata.svg)](https://travis-ci.org/ngParty/ng-metadata)

> Angular 2 style decorators for Angular 1.x

**ng-metadata** this is a viable solution for people,
who want to update **existing** ng1 codebases, with Typescript and using Angular 2 conventions and styles that runs today on Angular 1.3+.

**TL;DR**

It leads you, to to write **clean and component driven** style code.

Behind the scenes it uses ES7 decorators extended by Typescript( which add to the proposal parameter decorators etc...)

![ng-metadata logo](assets/logo/ng-metadata_logo.png)

## Installation

`npm i --save ng-metadata`

You have to allow nodeJs module resolution style in your `tsconfig.json`

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    ...
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

## Usage

Here we will demonstrate how to migrate from existing code base, to Typescrtipt with ng-metadata.

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

import {Component,Inject,Input,Output} from 'ng-metadat/ng-metadata';

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

      scope.$on('$destroy', function(){
        element.off('click');
      });

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
  .service(provide(UserSvc), UserSvc);;
```

### Startup Logic

#### Run Blocks

> try to not to use `run` api, because there is no equivalent in Angular 2

**ES5**
```js

// app.config.js
angular
    .module('app')
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

angular
    .module('app',[])
    .run(runBlock);
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
    })

});
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

angular
    .module('app',[])
    .config(StateConfig);
```