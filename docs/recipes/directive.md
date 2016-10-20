# Directive

Directive is represented in DOM as a `element attribute`, which consists from:

* controller
* no scope

> Directive should be used only for behavioral/extension purposes

Directive is registered via an `@NgModule`'s `declarations` metadata, or manually using `angular.directive` and `provide` (deprecated).

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
// clicker.module.js
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
// clicker.module.ts
import { NgModule } from 'ng-metadata/core';
import { ClickMeDirective } from './clicker.directive';

@NgModule({
  declarations: [ ClickMeDirective ]
})
export class ClickerModule {}
```

---

**(DEPRECATED) TS + ng-metadata using provide**

```typescript
// clicker.directive.ts
import { Directive, Inject, Input, HostListener } from 'ng-metadata/core';

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
// clicker.module.ts
import * as angular from 'angular';
import { provide } from 'ng-metadata/core';
import { ClickMe } from './clicker.directive';

angular.module('clicker',[])
  .directive( ...provide( ClickMe ) );
```
