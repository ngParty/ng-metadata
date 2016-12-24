# <a href='https://hotell.gitbooks.io/ng-metadata' style="display:flex;align-items:center;justify-content:center"><img src='https://github.com/ngParty/ng-metadata/blob/master/assets/logo/ngMetadata.png?raw=true' height='150'>ng-metadata</a>
 
> Angular 2 decorators for Angular 1.x 

someone on the Internet:

> The best Angular 1 yet!
> Back-ports almost all Angular 2 API to Angular 1, woot!

[![Build Status](https://travis-ci.org/ngParty/ng-metadata.svg)](https://travis-ci.org/ngParty/ng-metadata)
[![Dependencies Status](https://david-dm.org/ngParty/ng-metadata.svg)](https://david-dm.org/ngParty/ng-metadata)
[![devDependency Status](https://david-dm.org/ngParty/ng-metadata/dev-status.svg)](https://david-dm.org/ngParty/ng-metadata#info=devDependencies)
[![npm](https://img.shields.io/npm/v/ng-metadata.svg)](https://www.npmjs.com/package/ng-metadata)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/ngParty/ng-metadata/master/LICENSE)

**ng-metadata** is a great solution for people who want to gradually update an **existing** ng1 codebase to **TypeScript/ES2015** using Angular 2 conventions and styles that runs today on Angular 1.4+.

No hacks. No overrides. Production ready.

Upgrading your codebase is really easy and highly flexible, you can apply 3 strategies:
- per file upgrade with registration via `angular.module`
- per file upgrade with registration on root app component `@Component` metadata via `providers`/`directive`/`pipes`
- hybrid approach where you can combine both types

Advantages of `ng-metadata`:

- clean Angular 2 style DI with Angular 1
- write your apps in Angular 2 style today and be more productive! 
- removes the overhead of Angular 1 API's like link function, $scope, $element and what not and other strange angular 1 api syntax
- no abstractions, just pure Angular 1.x under the hood and power of ES.next decorators
- leads you, to to write **clean and component driven** code without complicated DDO definition APIs
- "forces" you think about your app as a component tree and in Angular 2 terms

Behind the scenes it uses ES.next decorators extended by TypeScript (which adds method decorators, parameter decorators etc...)
> parameter decorators are now at stage-0 in TC39, so probably it will be soon available in **Babel** so you can use all this goodness with ES2015 if you prefer pure JS

## Quick start

- [Plunkr][plunker-4.x] - try it out in your browser
- [Playground][playground] - live docs examples and mandatory TODO app example
- [Production ready starter kit][ngParty-Angular-1-scaffold] - Starter Kit ready for production by ngParty team powered by Webpack

## Learn

- Before doing anything, read the [bootstrapping guide for broad overview how to do things](docs/recipes/bootstrap.md)
- Browse the [documentation](https://hotell.gitbooks.io/ng-metadata/content/)
- How to migrate ES5 to TypeScript+ng-metadata: [Design Patterns/Recipes](docs/recipes/README.md)
- Check [FAQ](docs/FAQ.md) for more explanation why this exist

## The Gist

So what's the difference between an old school ES5 angular 1 app and a modern ng-metadata app?

I'm glad you asked! Here is a small comparison app:

**Angular 1.x with ES5:**

```js
// main.js
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

**ng-metadata and TypeScript:**

```typescript
// main.ts
import { platformBrowserDynamic } from 'ng-metadata/platform-browser-dynamic';
import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);

// app.module.ts
import { NgModule } from 'ng-metadata/core';
import { AppComponent } from './app.component';
import { HeroComponent } from './hero.component';
import { HeroService } from './hero.service';

@NgModule({
  declarations: [AppComponent, HeroComponent],
  providers: [HeroService]
})
export class AppModule {}

// app.component.ts
import { Component } from 'ng-metadata/core';

@Component({
  selector: 'my-app',
  template: `<hero [name]="$ctrl.name" (call)="$ctrl.onCall($event)"></hero>`
})
export class AppComponent {
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
    // here we are injecting by Type which is possible thanks to reflect-metadata and TypeScript and because our service
    // is defined as a class
    private heroSvc: HeroService
  ){}
  
  ngOnInit(){ /* your init logic */ }
  
}
```

## Installation

**Prerequisite: Node.js**

> Verify that you are running at least node v5.x.x and npm 3.x.x by running `node -v` and `npm -v` in a terminal/console window. Older versions may produce errors.

### Dependencies

Angular applications with ng-metadata depend upon features and functionality provided by a variety of third-party packages (including ng-metadata itself). 
These packages are maintained and installed with the Node Package Manager (npm).

All those dependencies will be stored in `package.json`.

There are three package categories in the dependencies section of the application package.json:

- **Features** - Feature packages provide our application with framework and utility capabilities.

- **Polyfills** - Polyfills plug gaps in the browser's JavaScript implementation.

- **Other** - Other libraries that support the application such as bootstrap for HTML widgets and styling etc...

##### Feature Packages

**angular** - There will be no life without Angular, right? :D

**angular-mocks** - You are testing your code right? right?

**ng-metadata** - Critical runtime parts of ng-metadata needed by every application. Includes all metadata decorators, Component, Directive, dependency injection, and the component lifecycle hooks. 
Includes 4 modules:
- [`ng-metadata/core`](docs/api/core/README.md),
- [`ng-metadata/platform-browser-dynamic`](docs/api/platform-browser-dynamic/README.md),
- [`ng-metadata/common`](docs/api/common/README.md),
- [`ng-metadata/testing`](docs/api/testing/README.md)

Install core dependencies by running:

`npm i --save angular angular-mocks ng-metadata`

##### Polyfill Packages

ng-metadata requires certain polyfills in the application environment. We install these polyfills with very specific npm packages that ng-metadata lists in the peerDependencies section of its package.json.

Install peer dependencies by running:

`npm i --save rxjs@5.0.1`

**rxjs** - a polyfill for the Observables specification currently before the TC39 committee that determines standards for the JavaScript language. Developers should be able to pick a preferred version of rxjs (within a compatible version range) without waiting for ng-metadata updates.

Install polyfills by runing:

`npm i --save core-js`

You also need to provide `Reflect.metadata` shim. This can be done by installing `npm i --save reflect-metadata` or by importing `import 'core-js/es7/reflect'` from `core-js` 

**core-js** - monkey patches the global context (window) with essential features of ES2015 (ES6). Developers may substitute an alternative polyfill that provides the same core APIs. This dependency should go away once these APIs are implemented by all supported ever-green browsers.

**reflect-metadata** - a dependency shared between ng-metadata and the TypeScript compiler. Developers should be able to update a TypeScript package without upgrading ng-metadata, which is why this is a dependency of the application and not a dependency of ng-metadata.



### Configure your project

TypeScript is a primary language for Angular application development with ng-metadata.

Browsers can't execute TypeScript directly. It has to be "transpiled" into JavaScript with the tsc compiler and that effort requires some configuration.

We need 3 things:

- tsconfig.json - TypeScript compiler configuration.
- typings - TypesScript declaration files.
- module loader/bundler - ES2015 modules are not natively in the browser so we need a tool for that 

#### [tsconfig.json](http://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

> TypeScript compiler configuration

We typically add a TypeScript configuration file (`tsconfig.json`) to our project to guide the compiler as it generates JavaScript files.

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "moduleResolution": "node",
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "removeComments": false,
    "noImplicitAny": false
  }
}
```

* `module` - you can use arbitrary module compilation type, depends on your module bundler, we prefer `commonjs` with `webpack`

#### TypeScript Declaration Files

Many JavaScript libraries such as jQuery, the Jasmine testing library, and Angular itself, extend the JavaScript environment with features and syntax that the TypeScript compiler doesn't recognize natively. 
When the compiler doesn't recognize something, it throws an error.

We use TypeScript type declaration files — *d.ts files* — to tell the compiler about the libraries we load.

> Many libraries include their definition files in their npm packages where both the TypeScript compiler and editors can find them. **ng-metadata** is one such library.

As of TypeScript 2.0, installing 3rd party declaration files is now very straightforward, and can be done directly from npm. Please see the official guide for more information: [https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html).

TypeScript 2 will automatically include any installed packages under the @types namespace in the compilation. For ng-metadata projects we will need the following declaration files:

- `npm install --save @types/core-js` // core-js's ES2015/ES6 shim which monkey patches the global context (window) with essential features of ES2015 (ES6)
- `npm install --save @types/node` // for code that references objects in the nodejs environment
- `npm install --save @types/jquery` // we need this to have proper typing support for angular jqLite
- `npm install --save @types/angular` // angular 1 type definitions, so you get Angular 1 API type checking
- `npm install --save @types/angular-mocks` // typings support for unit tests

#### Module loader / bundler

We prefer `webpack` but you can also go with `SystemJS`, which reminds me of RequireJS configuration hell, but yeah it's up to you ;) 

- For Webpack configuration see our [Angular 1 Starter](https://github.com/ngParty/Angular1-scaffold)
- For SystemJS configuration see [Plnkr Quickstart](https://plnkr.co/edit/s2lYnI?p=preview)

That's it! You are good to go!

## Why?

those are just few reasons why I made **ng-metadata**.

**ng-metadata:**
- can be used as part of an upgrade strategy, which may also include *ng-upgrade*, when migrating to Angular 2
- uses only pure angular 1 API under the hood
- templates are the same as in angular 1 + optionally binding type determined by template ( ng2 like ) 
- supports all kind of angular 1 api like creating providers/configuration/runBlocks and much more

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


[plunker-1.x]: https://plnkr.co/edit/s2lYnI
[plunker-2.x]: https://plnkr.co/edit/7Fr7oO
[plunker-3.x]: https://plnkr.co/edit/Bds0Bk
[plunker-4.x]: https://plnkr.co/edit/hsz8KF
[playground]: https://github.com/ngParty/ng-metadata/tree/master/playground
[ngParty-Angular-1-scaffold]: https://github.com/ngParty/Angular1-scaffold
