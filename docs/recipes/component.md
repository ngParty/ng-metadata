# Component

Component is represented in DOM as a `custom element`, which consists from:

* template
* controller
* isolate scope
* shadow dom ( transclusion/projection )

Component is registered via other `@Component` `directives` metadata or `bootstrap` 2nd (providers/root component) argument or legacy `angular.directive`(deprecated)

**ES5**

```js
// hero.component.js
angular.module('hero')
  .directive('hero',heroCmp);

function heroCmp(){
  return {
    scope: {},
    bindToController: {
      name: '=',
      onCall: '&'
    },
    controller: HeroController,
    controllerAs: '$ctrl',
    transclude: true,
    templateUrl: 'hero.html'
  };
}

HeroController.$inject = ['log'];
function HeroController($log){}
```

```js
// hero.js

angular.module('hero',[]);
```

**TS + ng-metadata**

```typescript
// hero.component.ts
import { Component, Inject, Input, Output, EventEmitter } from 'ng-metadata/core';

@Component({
  selector: 'hero',
  moduleId: module.id,
  templateUrl: './hero.html'
})
export class HeroComponent {

  @Input() name: string;
  @Output() onCall = new EventEmitter<void>();

  constructor(@Inject('$log') private $log: ng.ILogService){}

}
```

```typescript
// app.component.ts
import { Component } from 'ng-metadata/core';

import { HeroComponent } from './hero.component';

@Component({
  selector:'my-app',
  directives: [ HeroComponent ],
  template: `<hero [name]="'Martin'" (on-call)="$ctrl.called($event)"></hero>`
})
export class AppComponent{
  called(){
    console.log('called')
  }
}
```

---

**(DEPRECATED)TS + ng-metadata**

```typescript
// hero.component.ts
import {Component,Inject,Input,Output} from 'ng-metadata/core';

@Component({
  selector: 'hero',
  templateUrl: 'hero.html'
})
export class HeroCmp{

  @Input() name: string;
  @Output() onCall: Function;

  constructor(@Inject('$log') private $log: ng.ILogService){}

}
```

```typescript
// hero.ts
import * as angular from 'angular';
import {provide} from 'ng-metadata/core';
import {HeroCmp} from './hero.component';

angular.module('hero',[])
  .directive( ...provide(HeroCmp) );
```
