# Function

**@angular/upgrade/static upgrade helpers**

> supports AOT

- [bootstrap](#bootstrap)

> upgrade/downgrade

- [provideNg2Component](#provideng2component)
- [downgradeNg2Component](#downgradeng2component)
- [provideNg2Injectable](#provideng2injectable)
- [downgradeNg2Injectable](#downgradeng2injectable)
- [upgradeInjectable](#upgradeinjectable)

---

## bootstrap

### What it does

Bootstraps hybrid ng1 ( with ngMetadata ) ng2 app

### How to use

```typescript
// main.ts
import { UpgradeModule } from '@angular/upgrade/static/';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from 'ng-metadata/core';

import { Ng1AppModule } from './app/app.module';
import { AppModule } from './app/app.module.ng2';


if ( ENV === 'production' ) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(platformRef => {
    const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;

    upgrade.bootstrap(document.body, [Ng1AppModule.name], {strictDi: true});
});
```

```typescript
// ./app/app.module.ts
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static/';
import { provideNg2Component, provideNg2Injectable } from 'ng-metadata/upgrade'
import { NgModule, Directive, provide, getInjectableName, bundle } from 'ng-metadata/core';

import { AppComponent } from './app.component';

import { Logger, LoggerToken } from './logger.service.ng2';
import { LoginComponent } from './login.component.ng2';

import { HeroesService } from './heroes/heroes.service';

@NgModule( {
  declarations: [
    AppComponent,
    provideNg2Component({component: LoginComponent, downgradeFn: downgradeComponent}),
  ],
  providers: [
    HeroesService,
    provideNg2Injectable({injectable: Logger, downgradeFn: downgradeInjectable}),
  ]
} )
class AppModule {
}

// we are using bundle to export regular ng1 module
export const Ng1AppModule = bundle(AppModule);
```


## provideNg2Component

### What it does

Used to register an Angular 2 Component by including it in the `declarations` array of an ng-metadata `@NgModule`,
where the directive name and bindings(inputs,outputs) are automatically created from the selector.

### How to use

```typescript
// app.module.ts
import { downgradeComponent } from '@angular/upgrade/static/';
import { provideNg2Component } from 'ng-metadata/upgrade';
import { NgModule } from 'ng-metadata/core';

import { Ng2Component } from './components/ng2.component';

@NgModule({
 declarations:[
   provideNg2Component({component:Ng2Component,downgradeFn:downgradeComponent})
 ]
})
export class AppModule {};
```

### API

```typescript
type downgradeComponent = (info: {
    component: Type;
    inputs?: string[];
    outputs?: string[];
}) => any;
type ProvideNg2ComponentParams = {
  component:Type,
  downgradeFn:downgradeComponent
}
export function provideNg2Component({component,downgradeFn}: ProvideNg2ComponentParams): Function 
```

Takes a Angular 2 component and downgradeFn reference to `downgradeComponent` from `@angular/upgrade/static`

Returns a factory function that can be used to register the downgraded ng2 component on an Angular 1 via ngMetadata `@NgModule.declarations`.


## downgradeNg2Component

### What it does

Used to register an Angular 2 Component as a directive on an Angular 1 module,
where the directive name and bindings(inputs,outputs) are automatically created from the selector.

### How to use

```typescript
// app.module.ts
import * as angular from 'angular'
import { downgradeComponent } from '@angular/upgrade/static/';
import { downgradeNg2Component } from 'ng-metadata/upgrade';
import { provide } from 'ng-metadata/core';

import { Ng2Component } from './components/ng2.component';

export const AppModule = angular
 .module('myApp',[])
 .directive(...downgradeNg2Component({component:Ng2Component,downgradeFn:downgradeComponent}))
```

### API
```typescript
type downgradeComponent = (info: {
    component: Type;
    inputs?: string[];
    outputs?: string[];
}) => any;
type ProvideNg2ComponentParams = {
  component:Type,
  downgradeFn:downgradeComponent
}
export function downgradeNg2Component({component, downgradeFn}: ProvideNg2ComponentParams): [string, Function] 
```
Takes a Angular 2 component and downgradeFn reference to `downgradeComponent` from `@angular/upgrade/static`

Returns a tuple of component name and factory function that can be used to register the downgraded ng2 component on an Angular 1 module.


## provideNg2Injectable

### What it does

Used to register an Angular 2 Service by including it in the `providers` array of an ng-metadata `@NgModule`,
where the service name and downgraded factory functions are automatically generated.

**NOTE:** downgraded service must also be registered within Angular 2 Component or NgModule

### How to use

```typescript
// app.module.ts - Angular 1(ngMetadata)
import { downgradeInjectable } from '@angular/upgrade/static/';
import { provideNg2Injectable } from 'ng-metadata/upgrade';
import { NgModule } from 'ng-metadata/core';

import { Ng2Service } from './services/ng2.service';
import { Ng2ServiceDecorated } from './services/ng2decorated.service'

const OtherServiceToken = new OpaqueToken('otherService')

@NgModule({
 providers: [
   provideNg2Injectable({token:'ng2Service', injectable: Ng2Service, downgradeFn: downgradeInjectable }),
   provideNg2Injectable({token:OtherServiceToken, injectable: Ng2Service, downgradeFn: downgradeInjectable }),
   provideNg2Injectable({injectable:Ng2ServiceDecorated, downgradeFn: downgradeInjectable}),
 ],
})
export class AppModule{}
```

as you've may noticed in one registration we've omitted `token`, how is that possible that it works you ask?
this is thanks to ngMetadata `@Injectable()` decorator, we can decorate Angular 2 Classes with our ngMetadata `@Injectable`,
which gives us benefit to omit Opaque tokens creation and use the same class for DI for both Angular 2 and Angular 1.
POWER OVERWHELMING RIGHT?!

Enough Talk! Show me how the service looks like:
```typescript
// ./services/ng2decorated.service.ts

import {Injectable} from '@angular/core';
import {Injectable as KeepNg1Injectable} from 'ng-metadata/core';

@KeepNg1Injectable()
@Injectable()
export class Ng2ServiceDecorated {
 constructor(){}
 greet(){}
}
```

### API

```typescript
type ProviderLiteral = {
    provide: any;
    useClass?: Type;
    useValue?: any;
    useFactory?: Function;
    useExisting?: any;
    deps?: Object[];
    multi?: boolean;
}
type ProvideNg2InjectableParams = {
    injectable: Function | Type;
    downgradeFn: Function;
    /**
     * We need token only if downgraded Angular 2 Service is not Decorated with both ng2 @Injectable and ngMetadata @Injectable
     *
     */
    token?: string | OpaqueToken;
};

export function provideNg2Injectable({injectable, downgradeFn, token}: ProvideNg2InjectableParams): ProviderLiteral; 
```

Takes a Angular 2 service, downgradeFn reference to `downgradeInjectable` from `@angular/upgrade/static` and optional `token` that identifies a service provided from Angular 2+.

Returns a `ProviderLiteral` which can be used to register an Angular 2 Provider/Injectable
by including it in the providers array of an ng-metadata annotated Angular 1
`@Component` or `@NgModule`. Either a string or an ng-metadata OpaqueToken can be used for the name.


## downgradeNg2Injectable

### What it does

Downgrades an Angular 2 Injectable so that it can be registered as an Angular 1
factory. Either a string or an ng-metadata `OpaqueToken` can be used for the name.

**NOTE:** downgraded service must also be registered within Angular 2 `@Component` or `@NgModule`

### How to use

```typescript
// app.module.ts
import * as angular from 'angular'
import { downgradeInjectable } from '@angular/upgrade/static/';
import { downgradeNg2Injectable } from 'ng-metadata/upgrade';
import { provide } from 'ng-metadata/core';

import { Ng2Service } from './services/ng2.service';
import { Ng2ServiceDecorated } from './services/ng2decorated.service';

export const OtherServiceToken = new OpaqueToken('otherService')

export const AppModule = angular
  .module('myApp',[])
  .factory(...downgradeNg2Injectable({token:'ng2Service', injectable: Ng2Service, downgradeFn: downgradeInjectable }))
  .factory(...downgradeNg2Injectable({token: OtherServiceToken, injectable: Ng2Service, downgradeFn: downgradeInjectable }))
  .factory(...downgradeNg2Injectable({injectable:Ng2ServiceDecorated, downgradeFn: downgradeInjectable}))
 ```
### API

```typescript
type ProvideNg2InjectableParams = {
    injectable: Function | Type;
    downgradeFn: Function;
    /**
     * We need token only if downgraded Angular 2 Service is not Decorated with both ng2 @Injectable and ngMetadata @Injectable
     *
     */
    token?: string | OpaqueToken;
};

export function downgradeNg2Injectable( { injectable, downgradeFn, token }: ProvideNg2InjectableParams ): [string|Function]
```

Takes a Angular 2 service, downgradeFn reference to `downgradeInjectable` from `@angular/upgrade/static` and optional `token` that identifies a service provided from Angular 2+.

Returns a tuple of service name and factory function that can be used to register the downgraded ng2 service on an Angular 1 module.



## upgradeInjectable

### What it does

Helper function to upgrade Angular 1 services to Angular 2 without need of using lot of boilerplate 

### How to use

Let's say we have ngMetadata angular 1 Service:

```typescript
// heroes.service.ts
import { Injectable } from 'ng-metadata/core'
import { Hero } from './hero';

@Injectable()
export class HeroesService {
 get() {
   return [
     new Hero(1, 'Windstorm'),
     new Hero(2, 'Spiderman'),
   ];
 }
}
```

registered within ng-metadata NgModule:

```typescript
// app.module.ts
import { NgModule } from 'ng-metadata/core';
import { HeroesService } from './heroes/heroes.service';

@NgModule( {
 providers: [ HeroesService ]
} )
class AppModule {}
```

and we can upgrade it to Angular 2 like this:

```typescript
// app.module.ng2.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static/';
import { provideNg1Injectable } from 'ng-metadata/upgrade';

import { HeroComponent } from './heroes/hero.component.ng2';
import { HeroesService } from './heroes/heroes.service';

@NgModule({
 imports: [
   BrowserModule,
   UpgradeModule
 ],
 declarations: [
   HeroComponent
 ],
 providers: [
   provideNg1Injectable('$routeParams'),
   provideNg1Injectable(HeroesService),
 ],
 entryComponents: [
   HeroComponent
 ]
})
export class AppModule {
   // preventing automatic Bootstrap
   ngDoBootstrap() {}
}
```

and now we can use it within angular 2 Component:
```typescript
// hero.component.ng2.ts
import { Component, Inject } from '@angular/core';

@Component({
 selector: 'my-hero',
 template: `<h1>My Hero</h1>`,
})
class HeroComponent {
 constructor(
   @Inject('$routeParams') private $routeParams: any, // by name using @Inject
   private myCoolSvc: MyCoolService, // by type using the user defined token
   private heroesSvc: HeroesService // by type using ngMetadata @Injectable service class
 ) {}
}
```



