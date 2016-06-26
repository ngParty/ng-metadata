# Bootstrapping ( General overview how to do things )

ng-metadata is indeed very flexible, so it allows you to do things not just in one particular way!

This document is a broad overview how to do things within your app.

You have 2 options how to bootstrap:
- using ng-metadata/platform-browser-dynamic `bootstrap` function
- using traditional `angular.bootstrap`

You have 2 options how to register your components/directives/pipes/services:
- using `@Component/@Directive` decorators metadata ( Angular 2 way )
- using `provide` function within `ngModule.directive`,`ngModule.service` etc

You have 3 options how to define type of component/directive bindings
- by template ( angular 2 syntax )
- by Angular 1 special symbol within `Input` decorator
- by combining previous 2 types

## Bootstrap Options

### ng-metadata bootstrap

This is preferred way how to bootstrap your app, because it gives you ability to register other providers etc in Angular 2 way.

It allows you to `enableProdMode()` by very convenient way without touching the `ngModule.config` and configuring $compile and $http providers.

Also by default the app is bootstrap with `strictDi:true`, which you should be doing anyway.

Refactoring to this bootstrap is really easy, just create root app component and register all legacy angular 1 modules from your abb via bootstrap function 

```typescript
import { bootstrap } from 'ng-metadata/platform-browser-dynamic';
import { enableProdMode } from 'ng-metadata/core';

// some 3rd party
import * as ngSanitize from 'angular-sanitize';
import * as uiRouter from 'angular-ui-router';

// configuration function for `ngModule.config()`
import { configProviders } from './config' 

// root app component
import { AppComponent } from './app.component';
// old angular.module modules
import { UserModule, AmdminModule } from './modules';

// node env variable (available with Webpack)
if(env === 'production'){
  enableProdMode();
}

bootstrap( AppComponent, [ngSanitize, uiRouter, configProviders, UserModule, AmdminModule] );
```

This is initial state, it is advised to refactor those old Angular modules to be a root component of that module and registered
via `directives` metadata on AppComponent:

```typescript
import { Component } from 'ng-metadata/core';

import {AdminComponent} from './modules/admin'
import {UserComponent} from './modules/user'

@Component({
  selector: 'my-app',
  template:'...',
  directives: [AdminComponent,UserComponent]
})
export class AppComponent{}
```


### angular.bootstrap

```typescript
import * as angular from 'angular';
// some 3rd party
import * as ngSanitize from 'angular-sanitize';
import * as uiRouter from 'angular-ui-router';

// root AppModule is name of angular.module, a string
import { AppModule } from './index';

angular.bootstrap( document, [AppModule, ngSanitize, uiRouter], {strictDi: true} )
```

You can still leverage ng2 way of components registration without ng-metadata bootstrap, 
but you have to manually create your module bundle with `bundle` function:

```typescript
// index.ts - this is the index file used in previous boostrap example
import { bundle, Component } from 'ng-metadata/core';

import { UserModule } from './modules/user';
import { AdminDirectives, AdminProviders, AdminPipes, adminConfig } from './modules/admin'

@Component({
  selector: 'admin',
  template: '...',
  directives: [AdminDirectives],
  providers: [AdminProviders],
  pipes: [AdminPipes]
})
export class AdminComponent{}

const AdminModule = bundle(AdminComponent,[adminConfig]);

export const AppModule = angular.module('myApp',[UserModule, AdminModule]);
```


## Registering parts of your app

### `@Component/@Directive` decorators metadata ( Angular 2 way )

**Note:** Always remember that Angular 1 does not have Hierarchical Injector, so every service, directive, pipe you register, will be registered
to global Angular namespace

It highly advised to build you app as a component oriented tree and not register providers(services) within multiple nested components.

For registering services/factories/values within `provider` Component metadata property,
only [provider map literal](http://blog.thoughtram.io/angular/2016/05/13/angular-2-providers-using-map-literals.html) is allowed, `provide` function is deprecated. 

```typescript
// app.component.ts
import { Component, OpaqueToken } from 'ng-metadata/core';

import { AdminComponent } from './modules/admin';
import { UserComponent } from './modules/user';
// all of these are nested array which have particular providers, ngMetadata will flatten these arrays like Angular 2
import { SharedProviders, SharedDirectives, SharedPipes } from './shared'

const MyFooToken = new OpaqueToken('myFooValue')
const MyFactoryToken = new OpaqueToken('myFooFactory');

@Component({
  selector: 'my-app',
  template:'...',
  directives: [AdminComponent, UserComponent, SharedDirectives],
  providers: [
    SharedProviders, 
    // you can also use pure 'string' as provide value, but OpaqueToken makes DI easier, because you are using reference instead magic string
    { provide: MyFooToken, useValue: 'hello' }, 
    { provide: MyFactoryToken, useFactory: ($log)=>{ $log.log('a girl has no name') }, deps: ['$log'] } 
  ],
  pipes: [SharedPipes]
})
export class AppComponent{}
```


### `provide` function within `ngModule.directive`,`ngModule.service`

- using `provide` is deprecated, although it was the only registration method in previous version (ng-metadata 1.x), and you can still use it if you want

**NOTE** with provide there was no support for `factories`, so if you needed them you have to register them via old school `ngModule.factory()`

```typescript
// index.ts
import { provide, Component, OpaqueToken } from 'ng-metadata/core';

import { AdminModule } from './modules/admin';
import { UserModule } from './modules/user';
import { FooPipe, FooDirective, FooService  } from './shared'

const MyFooToken = new OpaqueToken('myFooValue')
const MyFactoryToken = new OpaqueToken('myFooFactory');

@Component({
  selector: 'my-app',
  template:'...',
})
export class AppComponent{}

fooFactory.$inject = ['$log'];
function fooFactory($log){ $log.log('a girl has no name') }

export const AppModule = angular.module('myApp',[])
  .directive( ...provide( AppComponent ))
  .directive( ...provide( FooDirective ))
  .filter( ...provide( FooPipe ))
  .service( ...provide( FooService ))
  .value( ...provide( MyFooToken, {useValue:'hello'} ) )
  .factory( MyFactoryToken, fooFactory)
  .name
```


## Binding Options

### by template ( angular 2 syntax )

This is the preferred way of defining bindings and you can easily migrate to it if you are coming from ng-metadata 1.x

```typescript
import { Component, Input, Output, EventEmitter } from 'ng-metadata/core';

@Component({
  selector: 'my-greeter',
  template: `
    mutate parent: <textarea ng-model="$ctrl.mutationMadness"></textarea>
    nickname: {{ ctrl.nickname }}
    <input ng-model="$ctrl.user.name">
    <button ng-click="$ctrl.greet.emit($ctrl.user.name)">greet!</button>
  `
})
export class GreeterComponent {
  @Input() mutationMadness: {};
  @Input() user: {name:string};
  @Input() nickName: string;
  @Output() greet = new EventEmitter<string>();
}

@Component({
  selector: 'my-app',
  directives: [GreeterComponent],
  template: `
    <my-greeter 
      [(mutation-madness)]="$ctrl.twoWayBoomerang" 
      [name]="$ctrl.user" 
      nick-name="{{ $ctrl.nick }}" 
      (greet)="$ctrl.onGreet($event)"
    ></my-greeter>`
})
export class AppComponent{
  user = {name:'Martin'};
  nick = 'Hotell';
  twoWayBoomerang = 'O oh, two way data binding, Im out of here!!!! Run for your life! :D';
  onGreet(name:string){
    console.log(`${name} says hello!`);
  }
}
```

### by Angular 1 special symbol within `Input` decorator

```typescript
import { Component, Input, Output, EventEmitter } from 'ng-metadata/core';

@Component({
  selector: 'my-greeter',
  template: `
    mutate parent: <textarea ng-model="$ctrl.mutationMadness"></textarea>
    nickname: {{ ctrl.nickname }}
    <input ng-model="$ctrl.user.name">
    <button ng-click="$ctrl.greet.emit($ctrl.user.name)">greet!</button>
  `
})
export class GreeterComponent {
  @Input('=') mutationMadness: {};
  @Input('<') user: {name:string};
  @Input('@') nickName: string;
  @Output() greet = new EventEmitter<string>();
}

@Component({
  selector: 'my-app',
  directives: [GreeterComponent],
  template: `
    <my-greeter 
      mutation-madness="$ctrl.twoWayBoomerang" 
      name="$ctrl.user" 
      nick-name="{{ $ctrl.nick }}" 
      greet="$ctrl.onGreet($event)"
    ></my-greeter>`
})
export class AppComponent{
  user = {name:'Martin'};
  nick = 'Hotell';
  twoWayBoomerang = 'O oh, two way data binding, Im out of here!!!! Run for your life! :D';
  onGreet(name:string){
    console.log(`${name} says hello!`);
  }
}
```

### combined by template + by declaration

You can also combine both type of bindings ( you may need this for directives for example ).

> we cannot bind one way to directive particular name, because this is how angular 1 compilator works.
It is although not recommended to directly bind to directive, rather create additional properties to make things clear

```typescript
import { Component, Directive, Input, Output, EventEmitter, HostListener } from 'ng-metadata/core';

@Directive({
  selector: 'my-greeter'
})
export class GreeterDirective {
  // here we combine both types of binding
  @Input('<') name: string;
  @Input() defaultName: string;
  @Output() greet = new EventEmitter<string>();
  
  @HostListener('click')
  onClick(){
    this.greet.emit(this.name || this.defaultName);
  }
}

@Component({
  selector: 'my-app',
  directives: [GreeterDirective],
  template: `
    <div my-greeter="$ctrl.name" [default-name]="'Martin'" (greet)="$ctrl.onGreet($event)"></div>`
})
export class AppComponent{
  name ='Martin';
  onGreet(name:string){
    console.log(`${name} says hello!`);
  }
}
```
