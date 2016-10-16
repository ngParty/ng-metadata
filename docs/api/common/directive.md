# Angular 1 Directives (Types)

We are providing angular directives as angular 2 like directives with proper types.
You can leverage these classes for DI

- [NgModel](#ngmodel)
- [NgForm](#ngform)
- [NgSelect](#ngselect)

## NgModel

[angular 1 docs](https://docs.angularjs.org/api/ng/type/ngModel.NgModelController) 

*example:*

```typescript
// app.ts
import * as angular from 'angular';
import {provide} from 'ng-metadata/core';
import {MyValidatorDirective} from './validator.directive';


angular.module('myApp',[])
  .directive(...provide(MyValidatorDirective));

// validator.directive.ts
import {Directive, OnInit} from 'ng-metadata/core';
import {NgModel} from 'ng-metadata/common';

@Directive({selector:'[my-validator]'})
export class MyValidatorDirective implements OnInit{
  // here we are injecting via Type! cool eh?
  constructor(private ngModel: NgModel){}
  ngOnInit(){
    this.ngModel.$validators.myCustomOne = (modelValue, viewValue) => { /* your validation logic */}
  }
}
```

## NgForm

[angular 1 docs](https://docs.angularjs.org/api/ng/type/form.FormController)

*example:*

```typescript
// app.ts
import * as angular from 'angular';
import {provide} from 'ng-metadata/core';
import {MyFormHandlerDirective} from './form-handler.directive';


angular.module('myApp',[])
  .directive(...provide(MyFormHandlerDirective));

// ./form-handler.directive.ts
import {Directive} from 'ng-metadata/core';
import {NgForm, NgModel} from 'ng-metadata/common';

@Directive({selector:'[my-form-handler]'})
export class MyFormHandlerDirective{
  // here we are injecting via Type! cool eh?
  constructor(private form: NgForm){}
  
  addCustomCntrol(someNgModel:NgModel){
    this.form.$addControl(someNgModel);
  }
}
```
 
## NgSelect

[angular 1 docs](https://docs.angularjs.org/api/ng/type/select.SelectController)
