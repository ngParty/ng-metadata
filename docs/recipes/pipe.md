# Pipe

Pipe is represented in DOM as an `pipe operator` on expression.

Under the hood it's just `angular.filter` which needs to implement `#transform` method

A Pipe is registered via an `@NgModule`'s `declarations` metadata, or manually using `angular.filter` and `provide` (deprecated).

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
// filters.module.js

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
// filters.module.ts
import { NgModule } from 'ng-metadata/core';
import { UppercasePipe } from './uppercase.pipe';

@NgModule({
  declarations: [ UppercasePipe ]
})
export class FiltersModule {}
```

---

**(DEPRECATED) TS + ng-metadata using provide**

```typescript
// uppercase.filter.ts
import { Pipe } from 'ng-metadata/core';

@Pipe({
  name:'uppercase'
})
export class UppercasePipe {

  transform(input: string | any): string | any {

    if(typeof input !== 'string'){
      return input;
    }

    return input.toUpperCase();
  }

}
```

```typescript
// filters.module.ts
import * as angular from 'angular';
import { provide } from 'ng-metadata/core';
import { UppercasePipe } from './uppercase.filter';

angular.module('filters',[])
  .filter( ...provide( UppercasePipe ) );
```
