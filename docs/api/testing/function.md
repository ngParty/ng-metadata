# Function

**Testing helpers**

- [renderFactory](#renderfactory)
- [getInput](#getinput)

---

## renderFactory
 
Helper for compiling Component/Directive classes within you unit test.
Use pattern shown in example:
  - create local render variable with interface IRender to tell tsc what type it would be
  - init it when you got $scope and $compile in beforeEach
  - use it within the test
    - if you want to override the inferred type from Directive argument use that via `<>` operator

*Example:*

```typescript
// my-component.ts
import {Component, Inject, Host} from 'ng-metadata/core';

@Component({ 
  selector:'my-component',
  template:'hello {{ $ctrl.greeting }}'
})
class MyComponent{
  
  greeting: string;
  
  constructor(@Inject('ngModel') @Host() private ngModel){}
  
  ngAfterViewInit(){
    this.ngModel.$render = ()=>{
      this.greeting = angular.copy(this.ngModel.$viewValue);
    }
  }
}

// my-component.spec.ts
import * as angular from 'angular';
import {expect} from 'chai';
import { MyModule } from './my';
import { MyComponent } from './my-component';
import { renderFactory, IRender } from 'ng-metadata/testing';

let $compile: ng.ICompileService;
let $rootScope: ng.IRootScopeService;
let $scope;
let render: IRender;

describe(`MyComponent`, ()=>{
  
  beforeEach(() => {

    angular.mock.module(MyModule);

  });
  
  beforeEach(angular.mock.inject((_$injector_: ng.auto.IInjectorService) => {

    const $injector = _$injector_;

    $compile = $injector.get<ng.ICompileService>('$compile');
    $rootScope = $injector.get<ng.IRootScopeService>('$rootScope');
    $scope = $rootScope.$new();

    render = renderFactory($compile,$scope);

  }));
  
  it(`should create the DOM and compile`, ()=>{
    const attrs = { 'ng-model':'model'};
    $scope.model = 'Martin!';
    
    // here we go!
    // it returns instance and compiled DOM
    const {compiledElement, ctrl} = render(MyComponent, {attrs});
    
    expect(ctrl instanceof MyComponent).to.equal(true);
    expect(compiledElement[0]).to.equal('<my-component ng-model="model">hello Martin!</my-component>');
  })
  
})
```

###### Parameters

| Parameter     | Type                            | Description                                  |
| ------------- | ------------------------------- |--------------------------------------------- |
| **$compile**  | `ng.ICompileService`            | core angular 1 $compile service from ng.mock |
| **$scope**    | `ng.IScope`                     | child scope for your component               |

returns render `Function`

###### Behind the Scenes

it builds whole DOM for component/directive, so you don't need to bother with html strings in your test.
Within it calls angular 1 well known $compile with provided $scope and re runs $digest loop to reflect the changes. 


## getInput
 
- gets input element from provided jqElement
