# Hybrid Angular 1 and 2 apps with "ngUpgrade"

The Angular core team provides a module called "ngUpgrade" which gives us the power to create a hybrid application -
one in which we use both Angular 1 and Angular 2 together.

This is a very natural migration-step for large Angular 1 apps, because it allows us to mix and match Components and Providers
from the two frameworks.

ng-metadata both supports `@angular/upgrade` and enhances it with some additional methods designed to help us take advantage of other ng-metadata features.

## Creating the upgradeAdapter singleton

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

## Bootstrapping our hybrid app

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

## Upgrading an Angular 1 Component

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

## Downgrading an Angular 2 Component

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

### 1) `upgradeAdapter.downgradeNg2Component()`

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

### 2) `upgradeAdapter.provideNg2Component()`

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

## Upgrading an Angular 1 Provider

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

## Downgrading an Angular 2 Provider

Naturally, we might also want to inject Angular 2 Providers into the Angular 1 Components in our hybrid app.

Just like with downgrading Angular 2 Components (as described above), ng-metadata offers two ways for us to
downgrade our Angular 2 Providers and register their compiled factory functions...

### 1) `upgradeAdapter.downgradeNg2Provider()`

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

### 2) `upgradeAdapter.provideNg2Provider()`

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

### NOTE: Using downgraded Angular 2 Providers in other Angular 2 Components/Providers

If we want to also use our downgraded Angular 2 Providers in other Angular 2 Providers or Components,
we need to _additionally_ add it as a Provider to the Angular 2 NgModule that we pass into the `@angular/upgrade` UpgradeAdapter in `upgrade-adapter.ts`.
