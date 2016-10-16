# Constants

In angular 1 with ES5 there was no module system so you had to register "shareable" constants to angular container for DI, via
`angular.module.constant('myFoo','whoopsie!)`

Those times are long gone now, use ES2015 modules for import/export


```typescript
// actions.ts
export const INCREMENT = 'INCREMENT'
export const DECREMENT = 'DECREMENT';

// reducers.ts
import {INCREMENT,DECREMENT} from './actions';
```
