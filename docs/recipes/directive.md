# Directive

Directive is represented in DOM as a `element attribute`, which consists from:

* controller
* no scope

> Directive should be used only for behavioral/extension purposes

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
