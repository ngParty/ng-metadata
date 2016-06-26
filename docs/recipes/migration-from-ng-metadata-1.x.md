# Migration from ng-metadata 1.x to 2.0

## bootstrap changes

- platform module endpoint was renamed from `ng-metadata/platform` to `ng-metadata/platform-browser-dynamic` to mirror intention and Angular 2 changes ( Angular 1 is always dynamic )
- `boostrap` has different API `(RootComponent: Type, customProviders?: Array<any|Type|string|any[]>)`

BEFORE (1.x):

```typescript
// app.component.ts
import { Component } from 'ng-metadata/core';

@Component({ 
  selector: 'app', 
  template: '...' 
})
export class AppComponent { }

// index.ts
import * as angular from 'angular';
import * as ThirdPartyModule from 'foo-bar';
import { provide } from 'ng-metadata/core';

import { SomeOldAngularModule } from './modules';
import { AppComponent } from './app.component';

export const AppModule = angular.module('app', [SomeOldAngularModule, ThirdPartyModule])
  .directive( ...provide(AppComponent) )
  .name;
  
// main.ts
import { bootstrap } from 'ng-metadata/platform';

import { AppModule } from './index';

bootstrap( AppModule );
```

NOW (2.0): 
```typescript
// app.component.ts
import { Component } from 'ng-metadata/core';

@Component({ 
  selector: 'app', 
  template: '...' 
})
export class AppComponent { }

// main.ts
import { bootstrap } from 'ng-metadata/platform-browser-dynamic';
import * as ThirdPartyModule from 'foo-bar';

import { SomeOldAngularModule } from './modules';
import { AppComponent } from './app.component';

bootstrap( AppComponent, [SomeOldAngularModule,ThirdPartyModule] )
```

## app parts registration changes

ng-metadata 2.0 comes with Angular 2 style of application instantiation. ( high five on that !)

That means that from now on the preferred way to register things is via @Component/@Directive `providers`/`viewProviders`/`directives`/`pipes` property metadata

But don't worry you don't have to rewrite everything! you can of course do that gradually.

Basic step is to create root AppComponent if you don't have one, and boot it via new `bootstrap` function . 
Then your other modules and component registered via `angular.module` and `service/directive/value/constant/config` can be provided as 2nd argument of `bootstrap` function and you can gradually upgrade things until `angular.module` and `provide` are completely removed.

See [Playground](https://github.com/ngParty/ng-metadata/tree/master/playground) for real life example how this hybrid works ;)

For further reference check [broad overview guide](/docs/recipes/bootstrap.md#registering-parts-of-your-app) 


## templates changes

- if you don't provide binding type `=`/`<`/`@` explicitly within @Input decorator, it will be determined from template.
You can combine both approaches, but we recommend to be consistent

For further reference check [broad overview guide](/docs/recipes/bootstrap.md#binding-options)

> **Note:** `@Output()` can consume both `(on-foo)="$ctrl.foo()` or `on-foo="$ctrl.foo()`


## @Output changes

- before @Output onFoo, was wrapped within abstract EventEmitter if you created new instance directly or not.
So you were able to call that property directly with locals payload `this.onFoo({$event:'hello'})` or via monkey patched emitter under the hood `this.onFoo.emit('hello')`
- now EventEmitter is real RxJS Subject back-ported from Angular 2, so those magical things won't work anymore

Update is pretty easy, assign all @Output to `new EventEmitter()` and instead of calling that functions call `propName.emit()`

BEFORE (1.x):
```typescript
import { Component, Output } from 'ng-metadata/core';


@Component({
  selector: 'my-child',
  template: `<button ng-click="$ctrl.doSomething()">click me </button>`,
})
class ChildComponent{
  @Output() onFoo: Function;
  doSomething(){
    this.onFoo({name:'Martin'})
  }
}

@Component({
  selector: 'my-app',
  template: `<my-child on-foo="$ctrl.clicked(name)"></my-child>`
})
class AppComponent{
  clicked(name){
    console.log(name);
  }
}
```

NOW (2.0):
```typescript
import { Component, Output, EventEmitter } from 'ng-metadata/core';


@Component({
  selector: 'my-child',
  template: `<button ng-click="$ctrl.doSomething()">click me </button>`,
})
class ChildComponent {
  @Output() onFoo = new EventEmitter<string>();
  doSomething(){
    this.onFoo.emit('Martin');
  }
}

@Component({
  selector: 'my-app',
  template: `<my-child (on-foo)="$ctrl.clicked($event)"></my-child>`,
  directives: [ChildComponent]
})
class AppComponent{
  clicked(name){
    console.log(name);
  }
}
```
