# Startup Logic

## Configuration/Routing

> try not to use `config` api, because there is no equivalent in Angular 2
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

```typescript
// state.config.ts

// we need to manually annotate DI
provideState.$inject = ['$stateProvider', '$urlRouterProvider'];
export function provideState($stateProvider, $urlRouterProvider){

  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/state1");
  
  // Now set up the states
  $stateProvider
    .state('state1', {
      url: '/state1',
      template: '<foo-component></foo-component>'
    });
}
```

```typescript
// app.module.ts
import { NgModule } from 'ng-metadata/core';
import { provideState } from './state.config';

@NgModule({
  providers: [provideState]
})
export class AppModule{}
```

---

**(Deprecated) TS + ng-metadata**

**NOTE:** don't use `this` within `StateConfig` class, because angular invokes `.config` function via `Function.apply` so `this` is `undefined`
 
```typescript
// app.states.ts

export class StateConfig{
  
  // we need to manually annotate DI
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

```typescript
// index.ts

import * as angular from 'angular';
import * as uiRouter from 'angular-ui-router';
import { StateConfig } from './app.config';

angular.module('app',[uiRouter])
  // NOTE: StateConfig class is not instantiated, angular will use the constructor as a factory function ( wrong 'this' context)
  .config( StateConfig );
```


## Run Blocks ( Deprecated )

> try to not to use `run` api, because there is no equivalent in Angular 2,
> instead do your initial run logic within service `constructor` or ngOnInit if it's in component/directive

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


**(DEPRECATED) TS + ng-metadata**

**NOTE:** don't use `this` within `RunBlock` class, because angular invokes `.config` function via `Function.apply` so `this` is `undefined`

```typescript
// app.config.ts

import { Inject } from 'ng-metadata/core';
import { Authenticator, Translator } from 'some-library';

export class RunBlock {
  
  static $inject = ['authenticator', 'translator'];
  constructor( authenticator: Authenticator, translator: Translator ) {
     authenticator.initialize();
     translator.initialize();
  }

}
```

```typescript
// app.ts

import * as angular from 'angular';
import { RunBlock } from './app.config';

angular.module('app',[])
  // NOTE: RunBlock class is not instantiated, angular will use the constructor as a factory function
  .run( RunBlock );
```
