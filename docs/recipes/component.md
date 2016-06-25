# Component

Component is represented in DOM as a `custom element`, which consists from:

* template
* controller
* isolate scope
* shadow dom ( transclusion )

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
