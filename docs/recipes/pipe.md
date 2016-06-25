# Pipe

Pipe is represented in DOM as an `pipe operator` on expression.

It's just classic `angular.filter` which needs to implement `#transform` method

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
