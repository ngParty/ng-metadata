# Component

Component is represented in DOM as a `custom element`, which consists from:

* template
* controller
* isolate scope
* shadow dom ( transclusion/projection )

A Component is registered via an `@NgModule`'s `declarations` metadata, or manually using `angular.directive` and `provide` (deprecated).

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
// hero.module.js

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
// hero.module.ts
import { NgModule } from 'ng-metadata/core';
import { HeroComponent } from './hero.component';

@NgModule({
  declarations: [ HeroComponent ]
})
export class HeroModule {}
```

---

**(DEPRECATED) TS + ng-metadata using provide**

```typescript
// hero.component.ts
import { Component, Inject, Input, Output } from 'ng-metadata/core';

@Component({
  selector: 'hero',
  templateUrl: 'hero.html'
})
export class HeroComponent {

  @Input() name: string;
  @Output() onCall: Function;

  constructor(@Inject('$log') private $log: ng.ILogService){}

}
```

```typescript
// hero.module.ts
import * as angular from 'angular';
import { provide } from 'ng-metadata/core';
import { HeroComponent } from './hero.component';

angular.module('hero',[])
  .directive( ...provide(HeroComponent) );
```
