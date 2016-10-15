# Function

- [enableProdMode](#enableprodmode)
- [forwardRef](#forwardref)

**Angular 1 container registration helper Methods**

- [provide](#provide) `@deprecated`
- [getInjectableName](#getinjectablename)
- [bundle](#bundle)

---

## enableProdMode

Disable Angular's development mode, which turns off debug data information and optimizes $http calls execution.

Behind the scenes we are setting:
- [`$compileProvider.debugInfoEnabled(false);`](https://docs.angularjs.org/guide/production#disabling-debug-data)
- [`$httpProvider.useApplyAsync(true)`](https://docs.angularjs.org/api/ng/provider/$httpProvider#useApplyAsync)


*example:*
```typescript
// main.ts
import { bootstrap } from 'ng-metadata/platform-browser-dynamic';
import { enableProdMode } from 'ng-metadata/core';

import { AppComponent } from './app.component';

enableProdMode();

bootstrap( AppComponent );
```

###### Parameters
none

returns `undefined`


## forwardRef

Allows to refer to references which are not yet defined.

For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of DI is declared,
but not yet defined. It is also used when the `token` which we use when creating a query is not yet defined.

###### Parameters

| Parameter         | Type                  | Description                               |
| ----------------- | ----------------------|------------------------------------------ |
| **forwardRefFn**  | `ForwardRefFn`        | callback function which returns demanded Injectable |

> ForwardRefFn:
> An interface that a function passed into forwardRef has to implement. `const ref = forwardRef(() => Lock);`

*example:*

```typescript
import * as angular from 'angular';
import { Component, Injectable, Inject, forwardRef, getInjectableName } from 'ng-metadata/core';

@Injectable()
class Door {
  lock: Lock;
  constructor(@Inject(forwardRef(() => Lock)) lock: Lock) { 
    this.lock = lock; 
  }
}

// Only at this point Lock is defined.
@Injectable()
class Lock {}

@Component({
  selector: 'my-app',
  providers: [Lock, Door]
})
class AppComponent{}


// test.ts
import { expect } from 'chai';

const $injector = angular.injector(['ng','myApp']);

const door = $injector.get(getInjectableName(Door));
expect(door instanceof Door).to.equal(true);
expect(door.lock instanceof Lock).to.equal(true);
```


## provide

> @deprecated, [use component tree composition and provide map literal instead](/docs/recipes/bootstrap.md)

Returns tuple`[name:string,Type:any]` `name` and appropriate `Type` by used decorator.
It's smart ( it knows if argument is Component or Directive or Pipe or Service ).

Has to be used with these `angular.*` methods as first argument via spread because angular methods require 2 args:
- `directive`
- `filter`
- `service`
- `value`
- `constant`

*Example:*

this:

```typescript
import * as angular from 'angular';
import { provide, Component } from 'ng-metadata/core';

@Component({
  selector:'hero-cmp',
  template:`<div>hello hero</div>`
})
class HeroComponent {}

angular.module('hero',[])
  .directive( ...provide( HeroComponent ) );
```

will register as `angular.directive('heroCmp', function directiveFactory(){ return {} })`.


> For Services which have @Injectable, by default, it will extract the generated `id` token

so this:

```typescript
import * as angular from 'angular';
import { provide } from 'ng-metadata/core';
import { HeroService } from './hero.service';

angular.module('hero',[])
  .service( ...provide( HeroService ) );
```

will register as `angular.service('heroSvc#12', HeroService)`

###### Parameters

| Parameter         | Type                            | Description                               |
| ----------------- | ------------------------------- |------------------------------------------ |
| **token**         | `class` or `string` or `OpaqueToken`        | class reference or string alias token     |
| **provideType?**  | `{useClass: class}` or `{useValue: any}`    | This is applicable only for angular `service`,`constant`,`value`,`factory`,`provider` methods |

returns tuple [`string`,`factory`] which is registered within angular container.

`useClass` - you have to specify your Class and string which you want to alias it. Note that once you do that, you have to
use this string across whole app

*example:*

```typescript
import * as angular from 'angular';
import { provide, Inject } from 'ng-metadata/core';

class MyService {}

angular.module('myApp')
  .constant(...provide( 'mySvc', { useClass: MyService } );

// now when you are injecting the constant in some service or so
export class MyLogger{
  constructor(
    @Inject('mySvc') private mySvc: MyService
  ){}
}
```

`useValue` - neat helper if you wanna register values or constants. It is advised to create opaque token for injectable, so you
don't use strings but references

*example:*

```typescript
import * as angular from 'angular';
import { provide, Inject, OpaqueToken } from 'ng-metadata/core';

export const myConstToken = new OpaqueToken('myConstanstYo');
export const myConstants = { foo: 123123, moo: '12312' };

angular.module('myApp')
  .constant(...provide( myConstToken, { useValue: myConstants } );

// now when you are injecting the constant in some service or so
export class MyService{
  constructor(
    @Inject(myConstToken) private myConst: typeof myConstants
  ){}
}
```

###### Behind the Scenes

`provide` extract name from various Types, which should be used for registration within angular.* methods.

- for **Injectable** it extraxts `id` property which is generated during class decoration. `id` is auto generated
- for **Component/Directive** it extracts `selector` property and transforms it to camel case
- for **Pipe** it extracts `name` property and transforms it to camel case
- for **Service** it extracts `name` from class property if supported by JS engine, or stringifies function name, and transforms it to camel case
( if useClass used the token overrides default behaviour )



## getInjectableName

A utility function that can be used to get the angular 1 injectable's name. Needed for some cases, since
injectable names are auto-created.

Works for string/OpaqueToken/Type
Note: Type must be decorated with one of class decorators(`@Injectable`,`@Component`,`@Directive`,`@Pipe`), otherwise it throws

*example:*

```typescript
import { Injectable, Component, Pipe, getInjectableName } from 'ng-metadata/core';
// this is given some random name like 'myService48' when it's created with `module.service`

@Injectable
class MyService {}

@Component({ selector: 'my-cmp', template: '...' })
class MyComponent{}

@Pipe({ name: 'kebabCase' })
class MyPipe{}
 
 
import { expect } from 'chai';

expect(getInjectableName(MyService)).to.equal('myService48');
expect(getInjectableName(MyComponent)).to.equal('myCmp');
expect(getInjectableName(MyPipe)).to.equal('kebabCase');
```

## bundle

Manually bundle NgModule with all it's dependencies registered via `@NgModule` providers/declarations/imports property metadata.

You may need this when migrating from previous ng-metadata 1.x to Angular 2 component bundling style.

It returns new instance of `angular.module` which can be then registered to other angular.modules or provided to `angular.bootstrap`

returns new created `angular.module` instance (if you don't provide existing one as 3rd argument) 

| Parameter          | Type                  | Description                               |
| -------------------| ----------------------|------------------------------------------ |
| **NgModuleClass** | `Type`                | NgModule class which is decorated by `@NgModule` |
| **otherProviders?**| `Array<Type,Function,string>` | you can optionally add other providers manual way ( also function for config phase ) |
| **angular.module?**| `ng.IModule` | you can provide existing angular.module instance, and if you do everything will be registered to this module instead of creating new one |
