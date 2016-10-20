# Values

In angular 1 with ES5 there was no module system so you had to register "shareable" constants to angular container for DI, via
`angular.module.value('myFoo','whoopsie!)` which was just another type of registering singleton services which doesn't needed other Dependencies to be injected.

If ES2015 modules are not enough and you really need to provide values or some functions via DI, this is how you can achieve that:

```typescript
// hero.service
import { Injectable, Inject } from 'ng-metadata/core';

import { MyValueToken } from './app.component';

@Injectable()
class HeroService {
  constructor(@Inject(MyValueToken) private myValue: string){}
}

// app.component.ts
import { Component, OpaqueToken } from 'ng-metadata/core';

import { HeroService } from './hero.service';

export const MyValueToken = new OpaqueToken('myValue');

@Component({
  selector:'my-app',  
  providers: [ 
    HeroService,
   { provide: MyValueToken, useValue: 'helloMama' }
  ],
  template: `....`
})
export class AppComponent{}
```
