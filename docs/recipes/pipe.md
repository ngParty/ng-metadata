# Pipe

Pipe is represented in DOM as an `pipe operator` on expression.

Under the hood it's just `angular.filter` which needs to implement `#transform` method

Pipe is registered via `@Component/@Directive` `pipes` metadata or `bootstrap` 2nd (providers) argument or legacy `angular.filter`(deprecated)

**ES5**

```js
// uppercase.filter.js

angular.module('filters')
  .filter('uppercase',uppercase);


function uppercase(){
  return function(input){

    if(typeof input !== 'string'){
      return input;
    }

    return input.toUpperCase();
    
  };
  
}  
```

```js
// uppercase.js

angular.module('filters',[]);
```

**TS + ng-metadata**

```typescript
// uppercase.pipe.ts
import { Pipe, PipeTransform } from 'ng-metadata/core';

@Pipe({
  name: 'uppercase'
})
export class UppercasePipe implements PipeTransform {

  transform(input: string|any): string|any {

    if(typeof input !== 'string'){
      return input;
    }

    return input.toUpperCase();
  }

}
```

```typescript
// app.component.ts
import { Component } from 'ng-metadata/core';

import { UppercasePipe } from './uppercase.pipe';

@Component({
  selector:'my-app',
  pipes: [ UppercasePipe ],
  template: `<div>{{ $ctrl.name | uppercase }}</div>`
})
export class AppComponent{
  name = 'a girl, has no name';
}
```

---

**(DEPRECATED)TS + ng-metadata**

```typescript
// uppercase.filter.ts
import {Pipe} from 'ng-metadata/core';

@Pipe({
  name:'uppercase'
})
export class UppercasePipe{

  transform(input: string|any): string|any {

    if(typeof input !== 'string'){
      return input;
    }

    return input.toUpperCase();
  }

}
```

```typescript
// uppercase.ts
import * as angular from 'angular';
import {provide} from 'ng-metadata/core';
import {UppercasePipe} from './uppercase.filter';

angular.module('filters',[])
  .filter( ...provide(UppercasePipe) );
```
