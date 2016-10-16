# Factory

Factory is some function that returns something ( most of the time it should return always something else ).

In angular 1. we can create reusable factories via `angular.module.factory`, this is not recommended with ng-metadata.

Instead use provide map literal: 

**useFactory** - the factory provider

The useFactory provider creates a dependency object by calling a factory function as seen in this example.

`{ provide: RUNNERS_UP,    useFactory:  runnersUpFactory(2), deps: [Hero, HeroService] }`


Use this technique to **create a dependency object** with a factory function whose inputs are some **combination of injected services and local state**.

The *dependency object* doesn't have to be a class instance. It could be anything. In this example, the dependency object is a string of the names of the runners-up to the "Hero of the Month" contest.

The local state is the number `2`, the number of runners-up this component should show. We execute `runnersUpFactory` immediately with `2`.

The `runnersUpFactory` itself isn't the provider factory function. The true provider factory function is the function that `runnersUpFactory` returns.

```typescript
// runners-up.ts (excerpt)
export function runnersUpFactory(take: number) {
  return (winner: Hero, heroService: HeroService): string => {
    /* ... */
  };
}
```

That returned function takes a winning Hero and a HeroService as arguments.

ng-metadata supplies these arguments from injected values identified by the two tokens in the `deps` array. 
The two `deps` values are tokens that the injector uses to provide these factory function dependencies.

After some undisclosed work, the function returns the string of names and Angular injects it into the `runnersUp` parameter of the `HeroOfTheMonthComponent`.

```typescript
//hero.ts

export class Hero {
  constructor(
    public id: number,
    public name: string,
    public description?: string,
    public phone?: string) {
  }
}

export const SomeHeroToken = new OpaqueToken('someHero');


//hero.service.ts
import { Injectable } from 'ng-metadata/core';
import { Hero } from './hero';

@Injectable()
export class HeroService {

  // TODO move to database
  private heroes: Array<Hero> = [
    new Hero(1, 'RubberMan', 'Hero of many talents', '123-456-7899'),
    new Hero(2, 'Magma', 'Hero of all trades', '555-555-5555'),
    new Hero(3, 'Mr. Nice', 'The name says it all', '111-222-3333')
 ];

  getHeroById(id: number): Hero {
    return this.heroes.filter(hero => hero.id === id)[0];
  }

  getAllHeroes(): Array<Hero> {
    return this.heroes;
  }
}


//runners-up.ts
import { OpaqueToken } from 'ng-metadata/core';

import { Hero } from './hero';
import { HeroService } from './hero.service';

export const RUNNERS_UP = new OpaqueToken('RunnersUp');

export function runnersUpFactory(take: number) {
  return (winner: Hero, heroService: HeroService): string => {
    /* ... */
    return heroService
          .getAllHeroes()
          .filter((hero) => hero.name !== winner.name)
          .map(hero => hero.name)
          .slice(0, Math.max(0, take))
          .join(', ');
  };
}

//hero-of-the-month.component.ts
import { Component, Inject, OpaqueToken } from 'ng-metadata/core';

import { SomeHeroToken } from './hero';
import { HeroService } from './hero.service';
import { RUNNERS_UP, runnersUpFactory } from './runners-up';
         
const someHero = new Hero(42, 'Magma', 'Had a great month!', '555-555-5555');

@Component({
  selector: 'hero-of-the-month',
  template: `...`,
  providers: [
    HeroService,
    { provide: SomeHeroToken, useValue:    someHero },
    { provide: RUNNERS_UP,    useFactory:  runnersUpFactory(2), deps: [SomeHeroToken, HeroService] }
  ]
})
export class HeroOfTheMonthComponent {
  constructor(
    @Inject(RUNNERS_UP) public runnersUp: string
  ){}
}
```
