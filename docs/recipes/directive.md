# Directive

Directive is represented in DOM as a `element attribute`, which consists from:

* controller
* no scope

> Directive should be used only for behavioral/extension purposes

Directive is registered via `@Component` `directives` metadata or `bootstrap` 2nd (providers) argument or legacy `angular.directive`(deprecated)

**ES5**

```js
// clicker.directive.js

angular.module('clicker')
  .directive('clickMe',clickMeDirective);

clickMeDirective.$inject = ['$log'];
function clickMeDirective($log){
  return {
    link: function postLink(scope,element,attrs){
      
      var me = attrs['me'];
      
      element
        .on('click', function(event){
          $log.info('you have clicked ' + me);
        });

      scope
        .$on('$destroy', function(){
          element.off('click');
        });

    }
  };
}
```

```js
// clicker.js

angular.module('clicker',[]);
```

**TS + ng-metadata**

```typescript
// clicker.directive.ts
import { Directive, Inject, Input, HostListener } from 'ng-metadata/core';

@Directive({
  // we are using same camelCase name as Angular 2 although in template it needs to be dash case because Angular 1 compiler
  selector: '[myClickMe]'
})
export class ClickMeDirective {

  constructor( @Inject('$log') private $log: ng.ILogService ) {}
  
  @Input() name: string;
  
  @HostListener('click')
  clickOnHostElement() {
    this.$log.info('you have clicked ' + this.name);
  }

}
```

```typescript
// app.component.ts
import { Component } from 'ng-metadata/core';

import { ClickMeDirective } from './clicker.directive';

@Component({
  selector:'my-app',
  directives: [ ClickMeDirective ],
  template: `<div my-click-me [name]="$ctrl.name">click this!</div>`
})
export class AppComponent{
  name = 'a girl, has no name';
}
```

---

**(DEPRECATED)TS + ng-metadata**

```typescript
// clicker.directive.ts

import {Directive,Inject,Input,HostListener} from 'ng-metadata/core';

@Directive({
  selector: '[click-me]'
})
export class ClickMe {

  constructor(
    @Inject('$log') private $log: ng.ILogService
  ) {}
  @Input('@') me: string;
  
  @HostListener('click')
  clickOnHostElement() {
    this.$log.info('you have clicked ' + this.me);
  }

}
```

```typescript
// clicker.ts

import * as angular from 'angular';
import {provide} from 'ng-metadata/core';
import {ClickMe} from './clicker.directive';

angular.module('clicker',[])
  .directive( ...provide(ClickMe) );
```
