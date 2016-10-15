# Class

**Global Injectables**

These services can be injected globally (standard Angular 1 injectables)

- [ROUTER_PRIMARY_COMPONENT](#router_primary_component)
- [RootRouter](#rootrouter)


**Local Injectables**

These services can be only injected from Component/Directive

These are not singletons, every component/directive owns it's own instance of the service

- [Router](#router)
- [RouteParams](#routeparams)
- [RouteData](#routerdata)


**Types**

- [RouteDefinition](#routedefinition)
- [RouteConfig](#routeconfig)
- [Instruction](#instruction)
- [ComponentInstruction](#componentinstruction)

---

## ROUTER_PRIMARY_COMPONENT

`OpaqueToken` used to bind the component with the top-level( Root ) `RouteConfig`s for the application.

We define the top level Root Component by providing a value for the ROUTER_PRIMARY_COMPONENT token.

**NOTE:**
- You must do this to tell Angular 1 downgraded ComponentRouter which comopnent is Root (this is done automaticaly in Angular 2 because app boots as a Tree).
- Unlike Angular 2, we need to provide string names to register the component, so in our case we use `getInjectableName` so we work with references

 > Once you register it, you can inject it within your app via `@Inject(ROUTER_PRIMARY_COMPONENT) routerRootComponent`, but don't forget that it's just `string` (name of rootComponent directive) under the hood
 > Under the hood the opaque token description is [$routerRootComponent](https://docs.angularjs.org/api/ngComponentRouter/service/$routerRootComponent)

```typescript
// app.module.ts
import { NgModule, getInjectableName } from 'ng-metadata/core';
import { ROUTER_PRIMARY_COMPONENT } from 'ng-metadata/router-deprecated';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [ AppComponent ],
  providers: [
    // we need to register 3rd party old angular module
    'ngComponentRouter',
    // Here we have specified that the Root Component is the AppCmponent.
    // We need to get component string name because Angular 1 works with string....
    { provide: ROUTER_PRIMARY_COMPONENT, useValue: getInjectableName( AppComponent ) }
  ]
})
export class AppModule {}

// main.ts
import { platformBrowserDynamic } from 'ng-metadata/platform-browser-dynamic';
import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule( AppModule );
```

## RootRouter

The singleton instance of the `RootRouter` type, which is associated with the top level `$routerRootComponent`.
[Angular 1 docs](https://docs.angularjs.org/api/ngComponentRouter/service/$routerRootComponent).

Thanks to ng-metadata we can inject it via Type without any strings. 

###### members
> it extends [`Router`](https://github.com/ngParty/ng-metadata/tree/master/src/router-deprecated/router.ts) base class, which has quite huge API.

| members           | Type       | Description                                  |
| ----------------- | ---------- |--------------------------------------------- |
| **registry**  | `RouteRegistry` | The RouteRegistry holds route configurations for each component in an Angular app. It is responsible for creating Instructions from URLs, and generating URLs based on route and parameters. |
| **location**  | `Location`      | window.location                             |
| **commit(instruction: `Instruction`, _skipLocationChange?: `boolean`)**  | `Function` | --- |
| **dispose()**  | `Function` | --- |

*example:*

```typescript
import { Component ,OnInit } from 'ng-metadata/core';
import { RootRouter } from 'ng-metadata/router-deprecated';

@Component( {
  selector: 'crisis-detail',
  template: `....`
} )
export class CrisisDetailComponent implements OnInit {

  constructor(
    // you can Inject rootRouter with Angular 1
    private rootRouter: RootRouter
  ) {}

  ngOnInit() {
    // log whole app router registry
    console.log(this.rootRouter.registry)
  }
}
```

---

## Router

A Router is responsible for mapping URLs to components.
[Angular 1 docs](https://docs.angularjs.org/api/ngComponentRouter/type/Router).

Each component has its own `Router`. 

**NOTE:**
> Unlike in Angular 2, we cannot use the dependency injector to get hold of a component's Router !!!
 
We can only inject the `RootRouter`. Instead we use the fact that the `ng-outlet` directive binds the current router to a `$router` attribute on our component.

So we can "inject it" via `@Input('<') $router: ChildRouter` binding to our component class.
The binding is available once the component has been activated, and the `$routerOnActivate` hook is called.

It is highly recommended to use this local `Router` for imperative navigation handling via `navigate()` and related methods

###### members
> it has quite huge API: [`Router`](https://github.com/ngParty/ng-metadata/tree/master/src/router-deprecated/router.ts).

| members           | Type       | Description                                  |
| ----------------- | ---------- |--------------------------------------------- |
| **navigating**  | `boolean` | You can see the state of a router by inspecting the read-only field router.navigating. This may be useful for showing a spinner, for instance. |
| **parent**  | `Router` | direct parent router on parent component if any. For `RootRoute` this is always `null` |
| **hostComponent** | `any` | hostComponent ( within angular 1 it's always string name of that component |
| **navigate( linkParams: any[] ): ng.IPromise<any>** | `Function` | Navigate based on the provided Route Link DSL. It's preferred to navigate with this method over `navigateByUrl`|
| **navigateByUrl( url: string, _skipLocationChange?: boolean ): ng.IPromise<any>** | `Function` | Navigate to a URL. Returns a promise that resolves when navigation is complete. It's preferred to navigate with `navigate` instead of this method, since URLs are more brittle.|
| **navigateByInstruction( instruction: Instruction, _skipLocationChange?: boolean ): ng.IPromise<any>** | `Function` | Navigate via the provided instruction. Returns a promise that resolves when navigation is complete|
| **generate( linkParams: any[] ): Instruction** | `Function` | Generate an `Instruction` based on the provided Route Link DSL. |
  
**example**

```typescript
import { Component, OnInit, Input } from 'ng-metadata/core';
import { ChildRouter, OnActivate, CanDeactivate } from 'ng-metadata/router-deprecated';

@Component({
  selector: 'crisis-detail',
  template: `
  <div>
    <md-spinner ng-if="$ctrl.navigationInProggess"></md-spinner>
  </div>`
})
export class CrisisDetailComponent implements OnInit, OnActivate, CanDeactivate {

  // here we need to set binding type by declaration because $router is created by 3rd party
  @Input( '<' ) $router: ChildRouter;
  
  get navigationInProggess(): boolean { return this.$router.navigating }
  
  gotoCrisis() {
    this.$router.navigate(['HeroList']);
  }

  // Generate an Instruction for a route and navigate directly with this instruction.  
  navigateViaInstruction(){
    const instruction = this.$router.generate(['HeroList']);
    this.$router.navigateByInstruction(instruction);
  }
  
  // this is discouraged because it couples the code of your component to the router URLs.
  manuallyCreateURLandNavigate(){
    this.$router.navigateByUrl('you/mama/is/fat');
  }    
  
}
```



## RouteParams

A map of parameters for a given route, passed as part of the `ComponentInstruction` to the Lifecycle Hooks, 
such as `$routerOnActivate` and `$routerOnDeactivate`

**NOTE:**
> Unlike in Angular 2, we cannot use the dependency injector to get hold of a component's RouterParams !!!

We obtain `RouteParams` via Lifecycle Hooks:

**example:**

```typescript
import { Component, OnInit, Input } from 'ng-metadata/core';
import { ComponentInstruction, OnActivate, Router } from 'ng-metadata/router-deprecated';

// we need to tell explicitly to typescript which keys should our route have
type CustomRouteParams = {
  [key: string]: string;
  id: string;
}

@Component( {
  selector: 'hero-detail',
  template: `
    <div ng-if="$ctrl.hero">     
      <button ng-click="$ctrl.gotoHeroes()">Back</button>
    </div>
  `
} )
export class HeroDetailComponent implements OnInit, OnActivate {

  // here we need to set binding type by declaration because $router is created by 3rd party
  @Input( '<' ) $router: Router;
  hero: Hero = null;

  constructor( private heroService: HeroService ) { }

  $routerOnActivate( next: ComponentInstruction ): void {
    // set routeParams with proper type annotation
    const routeParams = next.params as CustomRouteParams;
    // Get the hero identified by the route parameter
    const id = routeParams.id;
    
    this.heroService.getHero( id ).then( ( hero ) => {
      this.hero = hero;
    } );
  }

  gotoHeroes() {
    const heroId = this.hero && this.hero.id;
    this.$router.navigate( [ 'HeroList', { id: heroId } ] );
  }

  ngOnInit() { }

}
```


## RouteData

An immutable map of additional data you can configure in your Route, passed as part of the `ComponentInstruction` to the Lifecycle Hooks, 
such as `$routerOnActivate` and `$routerOnDeactivate`

**NOTE:**
> Unlike in Angular 2, we cannot use the dependency injector to get hold of a component's RouterData !!!

We obtain `RouteParams` via Lifecycle Hooks:

**example:**

```typescript
import { Component, OnInit } from 'ng-metadata/core';
import { ComponentInstruction, OnActivate, RouterData } from 'ng-metadata/router-deprecated';

// we need to tell explicitly to typescript which keys should our routeData have
type CustomRouteData = {
  [key: string]: string;
  foo: string;
}

@Component( {
  selector: 'hero-detail',
  template: `
    <div ng-if="$ctrl.hero">     
      <button ng-click="$ctrl.gotoHeroes()">Back</button>
    </div>
  `
} )
export class HeroDetailComponent implements OnInit, OnActivate {

  constructor( private heroService: HeroService ) { }

  $routerOnActivate( next: ComponentInstruction ): void {
    // set routeParams with proper type annotation
    const routeData = next.routeData;
    const cutomRouteData = routeData.data as CustomRouteData;
    // Get some data
    const foo = routeData.foo;
    
    console.log('data aquired!:', foo );
    
  }

  ngOnInit() { }

}
```

---


## RouteDefinition

Each item in the RouteConfig for a Routing Component is an instance of this type ( Object ). It can have the following properties:

- `path` or (regex and serializer) - defines how to recognize and generate this route (`string`)
- `component` | `loader` | `redirectTo` (requires exactly one of these) (camelCase - angular directive name `string`)
- `name` - the name used to identify the Route Definition when generating links (CapitalCase `string`)
- `useAsDefault` - (`boolean`)  indicates that if no other Route Definition matches the URL, then this Route Definition should be used by default.
- `data` (optional) `any`

## RouteConfig

- array of `RouteDefinition`
- declare it within `@Component` `legacy` property via `$routeConfig` key
- don't worry, Component definition are strictly typed so if you will make a typo there or provide wrong type for your route definition Typescript will tell you

**example**
```typescript
import { Component } from 'ng-metadata/core';

@Component( {
  selector: 'heroes',
  providers: [ HeroService ],
  template: `<h2>Heroes</h2><ng-outlet></ng-outlet>`,
  legacy: {
    $routeConfig: [
      { path: '/', name: 'HeroList', component: 'heroList', useAsDefault: true },
      { path: '/:id', name: 'HeroDetail', component: 'heroDetail' }
    ]
  }
} )
export class HeroesComponent {}
```

## Instruction

Instruction is a tree of ComponentInstructions with all the information needed to transition each component in the app to a given route, including all auxiliary routes.

Instructions can be created using Router, and can be used to perform route changes with Router.


## ComponentInstruction

A ComponentInstruction represents the route state for a single component.

ComponentInstructions is a public API. Instances of ComponentInstruction are passed to route lifecycle hooks
You should never construct one yourself with "new." Instead, rely on router's internal recognizer to construct ComponentInstructions.

You should not modify this object. It should be treated as immutable.

###### members

| Parameter     | Type     | Description        |
| ------------- | ---------|------------------- |
| **reuse** | `boolean` |    |
| **urlPath** | `string` |    |
| **urlParams** | `string[]` |  |
| **routeData** | `RouteData` |   |
| **componentType** | `string` |  |
| **terminal** | `boolean` |  |
| **specifity** | `string` |  |
| **params** | `RouteParams` |  |
| **routeName** | `string` |  |

