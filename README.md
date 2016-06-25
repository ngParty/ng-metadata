# <a href='https://github.com/ngParty/ng-metadata' style="display:flex;align-items:center;justify-content:center"><img src='https://github.com/ngParty/ng-metadata/blob/master/assets/logo/ngMetadata.png?raw=true' height='150'>ng-metadata</a>
 
> Angular 2 decorators for Angular 1.x 

someone on the Internet:

> The best Angular 1 yet!
> Back-ports almost all Angular 2 API to Angular 1, woot!

[![Build Status](https://travis-ci.org/ngParty/ng-metadata.svg)](https://travis-ci.org/ngParty/ng-metadata)
[![Dependencies Status](https://david-dm.org/ngParty/ng-metadata.svg)](https://david-dm.org/ngParty/ng-metadata)
[![devDependency Status](https://david-dm.org/ngParty/ng-metadata/dev-status.svg)](https://david-dm.org/ngParty/ng-metadata#info=devDependencies)
[![npm](https://img.shields.io/npm/v/ng-metadata.svg)](https://www.npmjs.com/package/ng-metadata)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/ngParty/ng-metadata/master/LICENSE)

**ng-metadata** this is a viable solution for people,
who want to gradually update **existing** ng1 codebase to **Typescript** using Angular 2 conventions and styles that 
runs today on Angular 1.4+.

## The Gist

So what's the difference between old school ES5 angular 1 app and ngMetadata modern app?

I'm glad you've asked! Here is comparison app:

**Angular 1.x with ES5:**

```js
// bootstrap.js
angular.element(document).ready(function(){
  angular.bootstrap(document,['hero']);
});

// hero.js
angular.module('hero',[]);

// hero.service.js
angular.module('hero')
  .service('heroSvc', HeroService);
 
HeroService.$inject = ['$http']; 
function HeroService($http){ this.$http = $http; }
HeroService.prototype.fetchAll = function(){
  return this.$http.get('/api/heroes');
}

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
    link: function(scope,element,attrs,ctrl){
      ctrl.init();
    },
    transclude: true,
    templateUrl: 'hero.html'
  };
}

HeroController.$inject = ['log','heroSvc'];
function HeroController($log, heroSvc){
  this.init = function(){ /* your init logic */ };
}
```

**ngMetadata and Typescript:**

```typescript
// bootstrap.ts
import { bootstrap } from 'ng-metadata/platform';
import { AppComponent } from './app.component';

bootstrap( AppComponent );


// app.component.ts
import { Component } from 'ng-metadata/core';
import { HeroComponent } from './hero.component';
import { HeroService } from './hero.service';

@Component({
  selector: 'my-app',
  template: `<hero [name]="$ctrl.name" (call)="$ctrl.onCall($event)"></hero>`,
  directives: [HeroComponent],
  providers: [HeroService]
})
export class AppComponent{ 
  name = 'Martin';
  onCall(){ /*...*/ }
}
  
// hero.service.ts
import { Injectable, Inject } from 'ng-metadata/core';   

@Injectable()
export class HeroService {
  constructor(@Inject('$http') private $http: ng.IHttpService){}
  fetchAll(){
      return this.$http.get('/api/heroes');
  }
}
  
// hero.component.ts
import { Component, Inject, Input, Output, EventEmitter, OnInit } from 'ng-metadata/core';
import { HeroService } from './hero.service';

@Component({
  selector: 'hero',
  moduleId: module.id,
  templateUrl: './hero.component.html',
  legacy:{ transclude: true }
})
export class HeroComponent implements OnInit {

  // one way binding determined by parent template
  @Input() name: string;
  @Output() call = new EventEmitter<void>();

  constructor(
    // we need to inject via @Inject because angular 1 doesn't give us proper types
    @Inject('$log') private $log: ng.ILogService,
    // here we are injecting by Type which is possible thanks to reflect-metadata and Typescript and because our service
    // is defined as a class
    private heroSvc: HeroService
  ){}
  
  ngOnInit(){ /* your init logic */ }
  
}
```

with `ngMetadata`, magic strings for DI are gone, no link function, no $scope, no $element and what not and no more strange angular 1 api syntax.
 
> Write your apps in Angular 2 style today and be more productive! 
> There are no abstractions, just pure Angular 1.x and power of Decorators.
> Treat yourself well and use that power! :)

**TL;DR**

It leads you, to to write **clean and component driven** style code without complicated DDO definition API.

Behind the scenes it uses ES7 decorators extended by Typescript( which adds method parameter decorators etc...)
> parameter decorators are now at stage-0 in TC39, so probably it will be soon available in **Babel** so you can use 
all this goodness with ES6 if you prefer pure JS

## Installation

`npm i --save ng-metadata`

You have to allow nodeJS module resolution style in your `tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs", // you can use arbitrary module compilation type, depends on your module bundler, we prefer commonjs with webpack
    "target": "es5",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

You need to install peer dependencies as well. you need obviously `angularjs` :) and `reflect-metadata` so we have
nice DI via Type injections provided by Typescript type annotations

install peer dependencies by running:

`npm i --save angular angular-mocks reflect-metadata core-js rxjs@5.0.0-beta.6`

It is also recommended to install angular 1 type definitions, so you get Angular 1 API type checking, via [typings](https://github.com/typings/typings)

We install typings type definition manager:

`npm i --save-dev typings`

Let's also add run scripts for the the typings tool to package.json:

```json
{
  "scripts": {
    "typings": "typings"
  }
}
```

We can now use Typings to install the type definitions for Angular 1

- `npm run typings install dt~core-js -- --save --global` // core-js's ES2015/ES6 shim which monkey patches the global context (window) with essential features of ES2015 (ES6)
- `npm run typings install dt~node -- --save --global` // for code that references objects in the nodejs environment
- `npm run typings install dt~jquery -- --save --global` // we need this to have proper typing support for angular jqLite
- `npm run typings install dt~angular -- --save --global`
- `npm run typings install dt~angular-mocks -- --save --global` // typings support for unit tests

That's it! You are good to go! Now just start importing from 4 various modules:
- [`ng-metadata/core`](docs/API.md#component),
- [`ng-metadata/platform`](docs/API.md#bootstrap),
- [`ng-metadata/common`](docs/API.md#ngmodel),
- [`ng-metadata/testing`](docs/API.md#renderfactory)


## Why

There is already an existing project, which gives us Angular 2 like syntax for Angular 1, [ng-forward](https://github.com/ngUpgraders/ng-forward)

While I respect all the hard work of the `ng-forward` team, there were things that I didn't like about their solution. 

Anyway that project (ngForward) is unmaintained with old/wrong angular 2 API's and isn't production ready at all.

- it tries to mirror angular 2 with lots of under the hood abstractions which is just not feasible because there are major differences, how things work in ng1 an ng2 
- it tries to do a lot unnecessary work, which was never finished ( support ES5/ES6  like angular 2 does )
- doesn't provides angular 2 like DI via constructor parameters because `babel` just won't support parameter decorators
- forces you to rewrite templates, so you can't be just 100% sure that your code will work as before 

> although we started a discussion about [collaboration](https://github.com/ngUpgraders/ng-forward/issues/138) I just don't think after further analysis, that we can merge 
our project one way or another.'
 
so those are just few reasons why I made **ng-metadata**.

**ng-metadata:**
- can be used as part of an upgrade strategy, which may also include *ng-upgrade*, when migrating to Angular 2
- uses only pure angular 1 API under the hood
- templates are the same as in angular 1 + optionally binding type determined by template ( ng2 like ) 
- supports all kind of angular 1 api like creating providers/configuration/runBlocks and much more

## Learn

- Browse the [API Reference](docs/API.md)
- How to migrate es5 to typescript+ngMetadata [Design Patterns](docs/DESIGN-PATTERNS.md)
- explore the [TODO app](playground)
- check [FAQ](docs/FAQ.md) for more explanation why this exist

## Support

### Need Help?

Jump into the [ngParty Slack team](https://ngparty.herokuapp.com/) to join the discussion...

### Think You Found a Bug?

First check the [issues](https://github.com/ngParty/ng-metadata/issues) list to see if someone else has already 
found it and there's an ongoing discussion. If not, submit an [issue](https://github.com/ngParty/ng-metadata/issues).
 Thanks!

## Contributing to the Project

We want help! Please take a look at the [Contribution Guide](CONTRIBUTING.md) for guidelines and jump in the Slack 
team to discuss how you can help: http://ngparty.slack.com... 
if you aren't a member just join us [ngParty slack](https://ngparty.herokuapp.com)
