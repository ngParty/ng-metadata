# Interface

## Lifecycle hooks:

- [CanActivate](#canactivate)
- [OnActivate](#onactivate)
- [CanReuse](#canreuse)
- [OnReuse](#onreuse)
- [OnDeactivate](#ondeactivate)


## CanActivate

Defines route lifecycle hook `CanActivate`, which is called by the router to determine if a component can be instantiated as part of a navigation.

**Note:**
> Note that unlike other lifecycle hooks, this one is injectable and needs to be defined as `static method` on component Class, rather than an interface.
> This is because the `$canActivate` function is called before the component is instantiated.

If `$canActivate`:
- returns or resolves to false, the navigation is cancelled. 
- throws or rejects, the navigation is also cancelled
- returns or resolves to true, navigation continues, the component is instantiated, and the `OnActivate` hook of that component is called if implemented.


`$canActivate` hook is Injectable by two injection types:

- Local:
The CanActivate hook is called with two ComponentInstructions as parameters, 
the first representing the current route being navigated to, and the second parameter representing the previous route or null.

Theses locals need be explicitly annoted via:
  - '$nextInstruction'
  - '$prevInstruction' 

- Global:
You can Inject any other service

You can of course mix injecting both local and global

**example:**

```typescript
import { Component, Inject } from 'ng-metadata/core';
import { ComponentInstruction } from 'ng-metadata/router-deprecated';

@Component( {
  selector: 'crisis-list',
  template: `....`
} )
export class CrisisListComponent {

  static $canActivate(
    @Inject( '$nextInstruction' ) $nextInstruction: ComponentInstruction,
    @Inject( '$prevInstruction' ) $prevInstruction: ComponentInstruction,
    @Inject( '$q' ) $q: ng.IQService,
    @Inject( '$timeout' ) $timeout: ng.ITimeoutService
  ): ng.IPromise<boolean> {
    const args = arguments;
    console.info( '$canActivate started!' );
    const promise = $q( ( resolve, reject ) => {
      $timeout( function () {
        resolve( true );
        console.info( '$canActivate with 500ms delay', args );
      }, 500 )
    } );
    return promise;
  }
```


## OnActivate

Defines route lifecycle method `$routerOnActivate`, which is called by the router at the end of a successful route navigation.

For a single component's navigation, only one of either `OnActivate` or `OnReuse` will be called depending on the result of `CanReuse`.

The `$routerOnActivate` hook is called with two ComponentInstructions as parameters, the first representing the current route being navigated to, and the second parameter representing the previous route or null.

If `$routerOnActivate` returns a promise, the route change will wait until the promise settles to instantiate and activate child components.

Implemented component class method signature:

```
$routerOnActivate(
  nextInstruction: ComponentInstruction,
  prevInstruction: ComponentInstruction
): any |ng.IPromise<any>;
```

**Example**

For our HeroList Component we want to load up the list of heroes when the Component is activated. So we implement the `$routerOnActivate()` instance method.
Running the application should update the browser's location to /heroes and display the list of heroes returned from the heroService.

*Important:*
> By returning a promise for the list of heroes from `$routerOnActivate()` **we can delay the activation of the Route until the heroes have arrived successfully**. This is similar to how a resolve works in `ngRoute`.

```typescript
import { Component, OnInit } from 'ng-metadata/core';
import { HeroService, Hero } from './hero.service';

@Component( {
  selector: 'hero-list',
  template: `
    <div ng-repeat="hero in $ctrl.heroes" >
      <a ng-link="['HeroDetail', {id: hero.id}]">{{hero.name}}</a>
    </div>
  `
} )
export class HeroListComponent implements OnInit {

  private selectedId = null;
  heroes: Hero[];

  constructor(private heroService: HeroService) { }

  ngOnInit() { }

  $routerOnActivate( next ): void {
    // Load up the heroes for this view, the component will be loaded after the promise is resolved!
    this.heroService.getHeroes().then( ( heroes ) => {
      this.heroes = heroes;
      this.selectedId = next.params.id;
    } );
  }

}
```

## CanReuse

Defines route lifecycle method `$routerCanReuse`, which is called by the router to determine whether a component should be reused across routes, or whether to destroy and instantiate a new component every time.

The `$routerCanReuse` hook is called with two `ComponentInstructions` as parameters, the first representing the current route being navigated to, and the second parameter representing the previous route.

If `$routerCanReuse`:
- returns or resolves to true, the component instance will be reused and the `OnDeactivate` hook will be run.
- returns or resolves to false, a new component will be instantiated, and the existing component will be deactivated and removed as part of the navigation.
- throws or rejects, the navigation will be cancelled.

Implemented component class method signature:

```
$routerCanReuse(
    nextInstruction: ComponentInstruction,
    prevInstruction: ComponentInstruction
  ): boolean | ng.IPromise<boolean>;
```

## OnReuse

Defines route lifecycle method `$routerOnReuse`, which is called by the router at the **end of a successful route navigation** when `CanReuse` is implemented and returns or resolves to true.

For a single component's navigation, only one of either `OnActivate` or `OnReuse` will be called, depending on the result of `CanReuse`.

The `$routerOnReuse` hook is called with two `ComponentInstructions` as parameters, the first representing the current route being navigated to, and the second parameter representing the previous route or null.

Implemented component class method signature:

```
$routerOnReuse(
    nextInstruction: ComponentInstruction,
    prevInstruction: ComponentInstruction
  ): any | ng.IPromise<any>;
```

## CanDeactivate

Defines route lifecycle method `$routerCanDeactivate`, which is called by the router to determine if a component can be removed as part of a navigation.

The `$routerCanDeactivate` hook is called with two `ComponentInstructions` as parameters, the first representing the current route being navigated to, and the second parameter representing the previous route.

If `$routerCanDeactivate`:
- returns or resolves to false, the navigation is cancelled. If it returns or resolves to true, then the navigation continues, and the component will be deactivated (the OnDeactivate hook will be run) and removed.
- throws or rejects, the navigation is also cancelled.

Implemented component class method signature:

```
$routerCanDeactivate(
  nextInstruction: ComponentInstruction,
  prevInstruction: ComponentInstruction
): boolean | ng.IPromise<boolean>;
```

## OnDeactivate

Defines route lifecycle method `$routerOnDeactivate`, which is called by the router before destroying a component as part of a route change.

The `$routerOnDeactivate` hook is called with two ComponentInstructions as parameters, the first representing the current route being navigated to, and the second parameter representing the previous route.

If `$routerOnDeactivate` returns a promise, the route change will wait until the promise settles.

Implemented component class method signature:

```
$routerCanDeactivate(
  nextInstruction: ComponentInstruction,
  prevInstruction: ComponentInstruction
): boolean | ng.IPromise<boolean>;
```
