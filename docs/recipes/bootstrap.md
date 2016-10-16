# Bootstrapping (General overview of how to do things)

ng-metadata is indeed very flexible, so it allows you to do things not just in one particular way!

This document is a broad overview how to do things within your app.

You have 2 options how to bootstrap:
- using ng-metadata/platform-browser-dynamic to create a `bootstrap` function
- using traditional `angular.bootstrap`

You have 2 options for registering your components/directives/pipes/services:
- using `@NgModule/@Component/@Directive` decorators metadata (Angular 2 way)
- using `provide` function within `angular.module.directive`, `angular.module.service` etc

You have 3 options for defining the type of component/directive bindings you are using:
- by template (Angular 2 syntax)
- by Angular 1 special symbol within `Input` decorator
- by combining previous 2 types

## Bootstrap Options

### ng-metadata bootstrap

This is preferred way to bootstrap your app, because it gives you ability to register other providers etc in an Angular 2 way.

It allows you to `enableProdMode()` in a very convenient way without touching `angular.module.config`, or configuring $compile and $http providers.

Also by default the app is bootstrapped with `strictDi:true`, which you should be doing anyway.

Refactoring to this bootstrap is really easy, just create a root app NgModule and register all legacy Angular 1 modules from your app.

```typescript
import { NgModule } from 'ng-metadata/core';

// some 3rd party Angular 1 module dependencies
import * as ngSanitize from 'angular-sanitize';
import * as uiRouter from 'angular-ui-router';

// configuration function for `angular.module.config()`
import { configProviders } from './config' 

// root app component
import { AppComponent } from './app.component';
// old angular.module modules
import { UserModule, AdminModule } from './modules';

@NgModule({
  // You can pass either Angular 1 `angular.module` names,
  // or other ng-metadata @NgModule classes to `imports`,
  // it will automatically figure out how to bundle them!
  imports: [ngSanitize, uiRouter, configProviders, UserModule, AdminModule],
  declarations: [AppComponent]
})
export class AppModule {}

// main.ts
import { platformBrowserDynamic } from 'ng-metadata/platform-browser-dynamic';
import { enableProdMode } from 'ng-metadata/core';
import { AppModule } from './app.module.ts';

// node env variable (available with Webpack)
if(env === 'production'){
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
```

### Manual Angular 1 angular.bootstrap

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
but you have to manually create your Angular 1 module from an ng-metadata @NgModule using the `bundle` helper function:

```typescript
// index.ts
import { bundle, Component, NgModule } from 'ng-metadata/core';

import { UserModule } from './modules/user';
import { AdminDirectives, AdminProviders, AdminPipes, adminConfig } from './modules/admin'

@Component({
  selector: 'admin',
  template: '...'
})
export class AdminComponent {}

@NgModule({
  declarations: [AdminComponent, AdminDirectives, AdminPipes],
  providers: [AdminProviders]
})
export class AdminModule {}

const Ng1AdminModule = bundle(AdminModule, [adminConfig]).name;

export const AppModule = angular.module('myApp',[UserModule, Ng1AdminModule]);
```


## Registering parts of your app

### `@Component/@Directive` decorators metadata (Angular 2 way)

**Note:** Always remember that Angular 1 does not have Hierarchical Injector, so every service, directive, pipe you register, will be registered
to global Angular namespace

It highly advised to build you app as a component oriented tree and not register providers (services) within multiple nested components.

For registering services/factories/values within `provider` Component metadata property,
only [provider map literal](http://blog.thoughtram.io/angular/2016/05/13/angular-2-providers-using-map-literals.html) is allowed, `provide` function is deprecated.

Just like in Angular 2:

- We can register Components, Directives, Pipes and Providers on NgModules.
- We can register Providers on Components.

```typescript
// app.component.ts
import { Component, OpaqueToken } from 'ng-metadata/core';

const MyFooToken = new OpaqueToken('myFooValue')
const MyFactoryToken = new OpaqueToken('myFooFactory');

@Component({
  selector: 'my-app',
  template:'...',
  providers: [
    // you can also use pure 'string' as provide value, but OpaqueToken makes DI easier, because you are using reference instead magic string
    { provide: MyFooToken, useValue: 'hello' }, 
    { provide: MyFactoryToken, useFactory: ($log)=>{ $log.log('a girl has no name') }, deps: ['$log'] } 
  ],
})
export class AppComponent{}

// app.module.ts
import { NgModule } from 'ng-metadata/core';
import { AdminComponent } from './modules/admin';
import { UserComponent } from './modules/user';
// all of these are nested array which have particular providers,
// ng-metadata will flatten these arrays like Angular 2
import { SharedProviders, SharedDirectives, SharedPipes } from './shared'

@NgModule({
  declarations: [AppComponent, SharedPipes, AdminComponent, UserComponent, SharedDirectives],
  providers: [SharedProviders]
})
export class AppModule {}
```


### `provide` function within `angular.module.directive`,`angular.module.service`

- using `provide` is deprecated, although it was the only registration method in previous version (ng-metadata 1.x), and you can still use it if you want

**NOTE** with provide there was no support for `factories`, so if you needed them you have to register them via old school `angular.module.factory()`

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

### by template (Angular 2 syntax)

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

You can also combine both type of bindings (you may need this for directives for example).

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
