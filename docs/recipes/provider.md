# Provider

Provider is just pure `ES2015 class` registered with `angular.provider` which has `$get` method, which returns new instance of service class.

> NOTE: you should use providers sparingly, because they don't exist in angular 2
> It is highly recommended to not use this Angular 1 obscure API construct because you have to use angular.module and deprecated provide to make it work

If you need to configure things, prefer creating configProvider functions, to set things up

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
```typescript
// droid.provider.ts

import { Inject } from 'ng-metadata/core';

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

```typescript
// droid.ts

import * as angular from 'angular';
import {provide} from 'ng-metadata/core';
import {DroidProvider} from './droid.provider';

angular.module('droid',[])
  // here we are using angular 2 like syntax registration
  // because we don't want to register the service as 'DroidProvider' but as 'droidSvc'
  .provider( ...provide('droidSvc', {useClass:DroidProvider}) );
```
