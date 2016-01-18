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

import {Pipe} from 'ng-metadata/core';

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

import {Inject} from 'ng-metadata/core';

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

import {Inject} from 'ng-metadata/core';
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

import {Inject} from 'ng-metadata/core';

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
