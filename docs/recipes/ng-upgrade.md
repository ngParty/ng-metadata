# Hybrid Angular 1 and 2 apps with "ngUpgrade"

The Angular core team provides a module called "ngUpgrade" which gives us the power to create a hybrid application -
one in which we use both Angular 1 and Angular 2 together.

This is a very natural migration-step for large Angular 1 apps, because it allows us to mix and match Components and Providers
from the two frameworks.

ng-metadata both supports `@angular/upgrade` and `@angular/upgrade/static` and enhances it with some additional methods designed to help us take advantage of other ng-metadata features.

There are 2 ways how to proceed with hybrid/upgrade process:
- [The Upgrade Module helpers ( recommended )](#aot-upgrade/downgrade-helpers)
- [Singleton upgradeAdapter (which is now deprecated)](#singleton-upgradeAdapter-Deprecated)

## AOT upgrade/downgrade helpers

> before reading this, we highly recommend to read [angular 2 cookbook](https://angular.io/docs/ts/latest/guide/upgrade.html#!#upgrading-with-the-upgrade-module) so you now what is done under the hood 

### Creating the Angular 2 Root module

we need to Create an `app.module.ng2.ts` file and add the following NgModule class:

```typescript
// app.module.ng2.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule
  ]
})
export class AppModule {
  ngDoBootstrap() {}
}
```

next we need to export traditional Angular1Module instead of ngMetadata `@NgModule` from our root `app.module.ts`

```diff
import { 
  NgModule,
+ bundle
} from 'ng-metadata/core';

import { AppComponent } from './app.component';
import { FooComponent } from './components/foo.component';
import { HeroesService } from './heroes/heroes.service';

@NgModule( {
  declarations: [
    AppComponent,
    FooComponent,
  ],
  providers: [
    HeroesService,
  ]
} )
- export class AppModule {
- }
+ class AppModule {
+ }

+ export const Ng1AppModule = bundle(AppModule);
```

**FINAL CODE**
```typescript
// app.module
import { 
  NgModule,
  bundle
} from 'ng-metadata/core';

import { AppComponent } from './app.component';
import { FooComponent } from './components/foo.component';
import { HeroesService } from './heroes/heroes.service';

@NgModule( {
  declarations: [
    AppComponent,
    FooComponent,
  ],
  providers: [
    HeroesService,
  ]
} )
class AppModule {
}

export const Ng1AppModule = bundle(AppModule);
```

### Bootstrapping our hybrid app

Now we bootstrap AppModule from `app.module.ng2.ts` using platformBrowserDynamic's bootstrapModule method. 
Then we use dependency injection to get a hold of the UpgradeModule instance in AppModule, and use it to bootstrap our Angular 1 app. 
The upgrade.bootstrap method takes the exact same arguments as `angular.bootstrap`

We will no longer use ng-metadata to bootstrap our app:

```diff
// main.ts
- import { platformBrowserDynamic } from 'ng-metadata/platform-browser-dynamic';
+ import { UpgradeModule } from '@angular/upgrade/static/';
+ import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
- import { AppModule } from './app.module'; // ng-metadata NgModule
+ import { Ng1AppModule } from './app.module'; // ng-metadata NgModule
+ import { AppModule } from './app/app.module.ng2';

- platformBrowserDynamic().bootstrapModule(AppModule);
+ platformBrowserDynamic().bootstrapModule(AppModule)
+  .then(platformRef => {
+    const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
+
+    upgrade.bootstrap(document.body, [Ng1AppModule.name], {strictDi: true});
+ });
```

**FINAL CODE**
```typescript
// main.ts
import { UpgradeModule } from '@angular/upgrade/static/';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Ng1AppModule } from './app.module'; // ng-metadata NgModule
import { AppModule } from './app/app.module.ng2';

platformBrowserDynamic().bootstrapModule(AppModule)
 .then(platformRef => {
   const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;

   upgrade.bootstrap(document.body, [Ng1AppModule.name], {strictDi: true});
});
```

now we can proceed with upgrade/downgrade our components/services

### Upgrading an Angular 1 Component and downgrading it back to ng1

ng-metadata is a project designed to help us write our Angular 1 Components
just like Angular 2 Components, so "upgrading" them with the upgradeAdapter as an interim migration step doesn't really make sense.

In a hybrid Angular 1 and 2 app, it is actually really easy for us to just change
a couple of things about our ng-metadata Component to make it a fully-fledged Angular 2 Component and then _downgrade_ it for use in our hybrid app.

Here is an example of an ng-metadata Angular 1 Component which just renders its input:

```typescript
// ./components/foo.component
import { Component, Input } from 'ng-metadata/core';

@Component({
  selector: 'my-foo',
  template: '<h1>Foo! {{ $ctrl.myInput }}</h1>',
})
export class FooComponent {
  @Input() myInput: string;
}
```

To update this Component to a fully fledged Angular 2 Component,
all we need to do is change the import path of our decorators and make sure our template syntax is correct.

In this case, the template only needs to have the `$ctrl` reference removed - in Angular 2 the `myInput` property is available directly.

**Upgraded Angular 1 Component:**

```diff
- import { Component, Input } from 'ng-metadata/core';
+ import { Component, Input } from '@angular/core';

@Component({
  selector: 'foo',
- template: '<h1>Foo! {{ $ctrl.myInput }}</h1>',  
+ template: '<h1>Foo! {{ myInput }}</h1>',
})
export class FooComponent {
  @Input() myInput: string;
}
```

Now we need to _downgrade_ the Component using one of the two **functions** outlined in the next section.
We also need to register it within Angular 2 and ngMetadata `@NgModule`.

#### Registering to NgModule

we need to register upgraded Component to Angular 2 
```diff
// app.module.ng2.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
+ import { FooComponent } from './components/foo.component';

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule
  ],
+  declarations: [
+    FooComponent
+  ]
})
export class AppModule {
  ngDoBootstrap() {}
}
```

and **downgrade** it back to Angular 1 and register it within ng-metadata @NgModule

```diff
// app.module
import { 
  NgModule,
  bundle
} from 'ng-metadata/core';
+ import { provideNg2Component } from 'ng-metadata/upgrade';
+ import { downgradeComponent } from '@angular/upgrade';

import { AppComponent } from './app.component';
import { FooComponent } from './components/foo.component';
import { HeroesService } from './heroes/heroes.service';

@NgModule( {
  declarations: [
    AppComponent,
-    FooComponent,    
+    provideNg2Component({component:FooComponent,downgradeFn:downgradeComponent}),
  ],
  providers: [
    HeroesService,
  ]
} )
class AppModule {
}

export const Ng1AppModule = bundle(AppModule);
```

Whole downgrade process and registration is handled by `provideNg2Component` ng-metadata function ( yes also `@Inputs` and `@Outputs`)

That's it! DONE!

We also provide helpers, if you are not using ng-metadata `@NgModule` for registration to angular 1 module

[Please see API docs for further docs](/docs/api/function.md)


### Upgrading an Angular 1 Service and downgrading it back to ng1

We have 2 options here:

- upgrade existing service to Angular 2 via Angular 2 `@NgModule.providers` and register it via ng-metadata `upgradeInjectable` helper
- upgrade the service to Angular 2 physically ( by changing import paths ) and downgrading it back to Angular 1 ng-metadata NgModule via `provideNg2Injectable` 

This is our initial ng-metadata Angular 1 service:

```typescript
// ./heroes/heroes.service
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

#### `upgradeInjectable` method

let's upgrade it to Angular 2

```diff
// app.module.ng2.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { FooComponent } from './components/foo.component';
+ import { HeroesService } from '/heroes/heroes.service';

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule
  ],
  declarations: [
    FooComponent
  ],
+  providers: [
+    provideNg1Injectable(HeroesService),
+  ]
})
export class AppModule {
  ngDoBootstrap() {}
}
```

done! we can now inject our Angular 1 service within Angular 2 entities, for example here is a ng2 component:
```typescript
import { Component, Inject } from '@angular/core';
import { HeroesService } from '/heroes/heroes.service';

@Component({
 selector: 'my-hero',
 template: `<h1>My Hero</h1>`,
})
class HeroComponent {
 constructor(
   @Inject('$routeParams') private $routeParams: any, // by name using @Inject
   private heroesSvc: HeroesService // by type using ngMetadata @Injectable service class
 ) {}
}
```

#### `provideNg2Injectable` method

We can migrate it directly to Angular 2 (if it doesn't has any Angular 1 injections) by changing path imports just like we did with Component

Here is the result:

```diff
// ./heroes/heroes.service
- import { Injectable } from 'ng-metadata/core'
+ import { Injectable } from '@angular/core'
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

now we need to register it to Angular 2 `@NgModule`

```diff
// app.module.ng2.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { FooComponent } from './components/foo.component';
+ import { HeroesService } from '/heroes/heroes.service';

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule
  ],
  declarations: [
    FooComponent
  ],
+  providers: [
+    HeroesService,
+  ]
})
export class AppModule {
  ngDoBootstrap() {}
}
```

and downgrade it to Angular 1 ng-metadata `@NgModule.providers`

```diff
// app.module
import { 
  NgModule,
  bundle
} from 'ng-metadata/core';
+ import { provideNg2Component } from 'ng-metadata/upgrade';
+ import { downgradeComponent } from '@angular/upgrade/static';

import { AppComponent } from './app.component';
import { FooComponent } from './components/foo.component';
- import { HeroesService } from './heroes/heroes.service';
+ import { HeroesService, HeroesServiceToken } from './heroes/heroes.service';

@NgModule( {
  declarations: [
    AppComponent,    
    provideNg2Component({component:FooComponent,downgradeFn:downgradeComponent}),
  ],
  providers: [
-    HeroesService,
+    provideNg2Injectable({token:HeroesServiceToken, injectable:HeroesService, downgradeFn: downgradeInjectable}),
  ]
} )
class AppModule {
}

export const Ng1AppModule = bundle(AppModule);
```

Note that we had to create ng-metadata `OpaqueToken` instance within `heroes.service.ts` so we have a Injectable reference within our Angular 1 app.
With this we need to change injection type in all Angular 1 ng-metadata entities, because ng1 cannot inject by Class type 

So we need to make changes like this:
```typescript
- constructor(private heroesSvc: HeroesService){}
+ constructor(@Inject(HeroesServiceToken) private heroesSvc: HeroesService){}
```

I don't know about you, but for me this is not very productive because we need to do even more refactoring.

**DON'T YOU WORRY THERE IS BETTER A WAY ;)**

First we need to annotate our upgraded ng2 service with ng-metadata `@Injectable`:

```diff
// ./heroes/heroes.service
- import { Injectable } from 'ng-metadata/core'
+ import { Injectable as NgMetadataInjectable } from 'ng-metadata/core'
+ import { Injectable } from '@angular/core'
import { Hero } from './hero';

+ @NgMetadataInjectable()
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

then register it to Angular 2 `@NgModule` as previously

```diff
// app.module.ng2.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { FooComponent } from './components/foo.component';
+ import { HeroesService } from '/heroes/heroes.service';

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule
  ],
  declarations: [
    FooComponent
  ],
+  providers: [
+    HeroesService,
+  ]
})
export class AppModule {
  ngDoBootstrap() {}
}
```

and downgrade it to Angular 1 ng-metadata `@NgModule` without `token` property !
 
**JUST LIKE THIS:**
```diff
// app.module
import { 
 NgModule,
 bundle
} from 'ng-metadata/core';
+ import { provideNg2Component } from 'ng-metadata/upgrade';
+ import { downgradeComponent } from '@angular/upgrade/static';

import { AppComponent } from './app.component';
import { FooComponent } from './components/foo.component';
import { HeroesService } from './heroes/heroes.service';

@NgModule( {
 declarations: [
   AppComponent,    
   provideNg2Component({component:FooComponent,downgradeFn:downgradeComponent}),
 ],
 providers: [
-    HeroesService,
+    provideNg2Injectable({injectable:HeroesService, downgradeFn: downgradeInjectable}),
 ]
} )
class AppModule {
}

export const Ng1AppModule = bundle(AppModule);
```

With this you don't need to change DI Injection within your app. I call this a WIN WIN !


We also provide helpers, if you are not using ng-metadata `@NgModule` for registration to angular 1 module
[Please see API docs for further docs](/docs/api/function.md)


---


## Singleton upgradeAdapter ( Deprecated )

### Creating the upgradeAdapter singleton

Just as outlined in the Angular 2 docs, we want to create a single instance of the UpgradeAdapter class and use that
everywhere in our application.

In the root of our project we create `upgrade-adapter.ts`, which will export the singleton and be referenced later.

We first instantiate the `@angular/upgrade` UpdateAdapter using an Angular 2 NgModule (NOTE: not an ng-metadata NgModule).

Then, in order to create our "supercharged" upgradeAdapter singleton, we pass the instantiated `@angular/upgrade` UpdateAdapter to the `NgMetadataUpgradeAdapter` constructor.

Our file should now look like this:

*upgrade-adapter.ts*:

```typescript
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { UpgradeAdapter } from '@angular/upgrade'
import { NgMetadataUpgradeAdapter } from 'ng-metadata/upgrade'

// Angular 2 NgModule (not ng-metadata NgModule)
@NgModule({
	imports: [BrowserModule], // required Angular 2 BrowserModule
})
class UpgradeModule {}

const instantiatedAdapter = new UpgradeAdapter(UpgradeModule)

// Export the "supercharged" ng-metadata upgradeAdapter singleton
export const upgradeAdapter = new NgMetadataUpgradeAdapter(instantiatedAdapter)
```

### Bootstrapping our hybrid app

In order for the dependency injection and change detection systems of both frameworks
to work harmoniously together, we need to update the bootstrap process of our app to
use the `upgradeAdapter` singleton.

This is simply a case of importing it and using its bootstrap method instead of
the bootstrap function created via platformBrowserDynamic() from `ng-metadata/platform-browser-dynamic`.

*BEFORE: main.ts*

```typescript
import { platformBrowserDynamic } from 'ng-metadata/platform-browser-dynamic';
import { AppModule } from './app.module'; // ng-metadata NgModule
// ...other imports
// ...etc

platformBrowserDynamic().bootstrapModule(AppModule);
```

*AFTER: main.ts*

```typescript
import { upgradeAdapter } from './upgrade-adapter';
import { AppModule } from './app.module.ts'; // ng-metadata NgModule
// ...other imports
// ...etc

upgradeAdapter.bootstrap( AppModule );
```

### Upgrading an Angular 1 Component

ng-metadata is a project designed to help us write our Angular 1 Components
just like Angular 2 Components, so "upgrading" them with the upgradeAdapter as an interim migration step doesn't really make sense.

In a hybrid Angular 1 and 2 app, it is actually really easy for us to just change
a couple of things about our ng-metadata Component to make it a fully-fledged Angular 2 Component and then _downgrade_ it for use in our hybrid app.

Here is an example of an ng-metadata Angular 1 Component which just renders its input:

```typescript
import { Component, Input } from 'ng-metadata/core';

@Component({
  selector: 'foo',
  template: '<h1>Foo! {{ $ctrl.myInput }}</h1>',
})
export class FooComponent {

  @Input() myInput: string;

}
```

To update this Component to a fully fledged Angular 2 Component,
all we need to do is change the import path of our decorators and make sure our template syntax is correct.

In this case, the template only needs to have the `$ctrl` reference removed - in Angular 2 the `myInput` property is available directly.

**Angular 2 version of the Component above:**

```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'foo',
  template: '<h1>Foo! {{ myInput }}</h1>',
})
export class FooComponent {

  @Input() myInput: string;

}
```

We can now _downgrade_ the Component using one of the two methods outlined in the next section.

### Downgrading an Angular 2 Component

When we start creating "native" Angular 2 Components in our hybrid application, we will need to
downgrade them before we can register them as directives.

As you can see in this example Component, there is nothing but pure Angular 2 here:

*ng2.component.ts*

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'angular-two',
  template: `<h1>Hello, ng2!</h1>`,
})
export class Ng2Component {

  constructor() {
    console.log( 'Woop!' );
  }

}
```

ng-metadata offers two ways for us to downgrade our Ng2Component for use in our hybrid app...

#### 1) `upgradeAdapter.downgradeNg2Component()`

If we want to manually register the downgraded Component as a directive on an Angular 1 module,
we can do that in a very similar way to how we have traditionally used ng-metadata's `provide()` function for Angular 1 Components.

As with `provide()`, ng-metadata will infer the name of the compiled directive from the Component selector:

```typescript
import * as angular from 'angular';

// Our upgradeAdapter singleton
import { upgradeAdapter } from '../upgrade-adapter';

// Our example Angular 2 Component
import { Ng2Component } from './ng2.component.ts';

// Our old Angular 1 Module
export const FooModule = angular.module( 'foo', [] )

  // The classic `provide()` helper from ng-metadata would look
  // like this for an Angular 1 Component.
  // .directive( ...provide( SomeNg1Component ) )
  //
  // Just like `provide()`, ng-metadata's `downgradeNg2Component()`
  // helper removes the need for us to manually set a string for
  // the name of the compiled Angular 1 directive.
  //
  // In this example the directive name will be set to "angularTwo"
  // (from the Component selector "angular-two" above).
  .directive( ...upgradeAdapter.downgradeNg2Component( Ng2Component ) );
```

#### 2) `upgradeAdapter.provideNg2Component()`

In order to make our ng-metadata apps match as closely to Angular 2
apps as is reasonable, we want to avoid dealing with Angular 1 modules directly in our code.

As of ng-metadata 3.0, we can let ng-metadata deal with creating the Angular 1
modules behind the scenes, and register our directives and providers
directly onto parent NgModules.

For this reason, ng-metadata's upgradeAdapter also offers a helper function for
registering a downgraded Angular 2 Component directly on an ng-metadata NgModule's declarations array called `provideNg2Component()`.

```typescript
import { NgModule } from 'ng-metadata/core';

// Our upgradeAdapter singleton
import { upgradeAdapter } from '../upgrade-adapter';

// Our example Angular 2 Component
import { Ng2Component } from './ng2.component.ts';

@NgModule({
  declarations: [
    // Ng1Component,
    // SomeOtherNg1Component,
    // ...etc...
    upgradeAdapter.provideNg2Component( Ng2Component ),
  ],
})
export class SomeParentModule {}
```

### Upgrading an Angular 1 Provider

If we need to use an Angular 1 Provider within Angular 2 Components and Providers during our migration
phase, we can use `upgradeAdapter.upgradeNg1Provider()`.

When using the upgraded Provider for dependency injection, either the name string can be used with @Inject, or
a given token can be injected by type.

Here is an example of each variant in action:

```typescript
// Somewhere in your app, the providers are upgraded,
// either as a string or as a given token
// E.g.

class $state {}

upgradeAdapter.upgradeNg1Provider('$state', { asToken: $state })
upgradeAdapter.upgradeNg1Provider('$rootScope')
```

**ng2.component.ts**

```typescript
import { Component, Inject } from '@angular/core';
import { $state } from '../some-file.ts'

@Component({
 selector: 'ng2',
 template: `<h1>Ng2</h1>`,
})
class Ng2Component {

 constructor(
   @Inject('$rootScope') private $rootScope: any, // by name using @Inject
   private $state: $state // by type using the user defined token
 ) {}

}
```

### Downgrading an Angular 2 Provider

Naturally, we might also want to inject Angular 2 Providers into the Angular 1 Components in our hybrid app.

Just like with downgrading Angular 2 Components (as described above), ng-metadata offers two ways for us to
downgrade our Angular 2 Providers and register their compiled factory functions...

#### 1) `upgradeAdapter.downgradeNg2Provider()`

The `downgradeNg2Provider()` helper function works in a similar way to the `downgradeNg2Component()` function.
In the case of Providers, however, there is no metadata to use to infer the name from, so we need to provide
a string or an OpaqueToken for this purpose.

We can see an example of each method here:

```typescript
import * as angular from 'angular';

// An Angular 2 Provider
import { Ng2Service } from './ng2.service.ts';

const otherServiceToken = new OpaqueToken( 'otherService' )

// Our old Angular 1 Module
export const FooModule = angular.module( 'foo', [] )

  // Using a string for the name
  .factory( ...upgradeAdapter.downgradeNg2Provider( 'ng2Service', { useClass: Ng2Service }) )

  // Using an OpaqueToken for the name
  .factory( ...upgradeAdapter.downgradeNg2Provider( otherServiceToken, { useClass: Ng2Service }) )
```

#### 2) `upgradeAdapter.provideNg2Provider()`

The alternative to directly interacting with an Angular 1 module (not recommended)
for the purposes of registering Provider, is to make use of the providers array on an NgModule.

Just like with downgrading and registering Angular 2 Components, ng-metadata offers us a helper for this called `provideNg2Provider()`.

It takes the same arguments as `downgradeNg2Provider()`, as we can see in the example below:

```typescript
import { Component } from 'ng-metadata/core';

// Our upgradeAdapter singleton
import { upgradeAdapter } from '../upgrade-adapter';

// An Angular 2 Provider
import { Ng2Service } from './ng2.service.ts';

const otherServiceToken = new OpaqueToken( 'otherService' );

@Component({
  selector: 'foo',
  template: '<h1>Foo!</h1>',
  providers: [

    // Using a string for the name
    upgradeAdapter.provideNg2Provider( 'ng2Service', { useClass: Ng2Service } ),

    // Using an OpaqueToken for the name
    upgradeAdapter.provideNg2Provider( otherServiceToken, { useClass: Ng2Service } ),

  ],
})
export class FooComponent {

  constructor() {
    console.log( 'No more angular.module!' );
  }

}
```

#### NOTE: Using downgraded Angular 2 Providers in other Angular 2 Components/Providers

If we want to also use our downgraded Angular 2 Providers in other Angular 2 Providers or Components,
we need to _additionally_ add it as a Provider to the Angular 2 NgModule that we pass into the `@angular/upgrade` UpgradeAdapter in `upgrade-adapter.ts`.
