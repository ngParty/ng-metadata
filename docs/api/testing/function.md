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
import { Component, Host } from 'ng-metadata/core';
import { NgModel } from 'ng-metadata/common';

@Component({ 
  selector:'my-component',
  template:'hello {{ $ctrl.greeting }}'
})
class MyComponent{
  
  greeting: string;
  
  constructor(@Host() private ngModel: NgModel){}
  
  ngAfterViewInit(){
    this.ngModel.$render = () => {
      this.greeting = angular.copy(this.ngModel.$viewValue);
    }
  }
}

// my-component.spec.ts
import * as angular from 'angular';
import { expect } from 'chai';
import { MyComponent } from './my-component';
import { renderFactory, IRender } from 'ng-metadata/testing';
import { bundle, getInjectableName, NgModule } from 'ng-metadata/core';

describe(`MyComponent`, () => {
  
  @Component( {
    selector: 'test-component',
    template: `<my-component ng-model="$ctrl.data"></my-component>`
  } )
  class TestComponent {
    data = { name: 'Martin' }
  }

  @NgModule({
    declarations: [ TestComponent, MyComponent ]
  })
  class TestNgModule {}
  
  const TestModule: string = bundle(TestNgModule).name;
  
  let $compile: ng.ICompileService;
  let $rootScope: ng.IRootScopeService;
  let $scope: ng.IScope;
  let render: IRender<TestComponent>;
  
  beforeEach(() => {
    // load our created Angular Module
    angular.mock.module(TestModule);
  });
  
  beforeEach(angular.mock.inject(($injector: ng.auto.IInjectorService) => {

    $compile = $injector.get<ng.ICompileService>('$compile');
    $rootScope = $injector.get<ng.IRootScopeService>('$rootScope');
    $scope = $rootScope.$new();

    render = renderFactory( $compile, $scope );

  }));
  
  it(`should create the DOM and compile`, () => {   
    
    // here we go!
    // it returns instance and compiled DOM of testComponent
    const {compiledElement} = render(TestComponent);
    
    // now we need to get our tested component
    const {debugElement,componentInstance} = queryByDirective(compiledElement,MyComponent);
    
    expect(componentInstance instanceof MyComponent).to.equal(true);
    expect(debugElement[0]).to.equal('<my-component ng-model="$ctrl.data">hello Martin!</my-component>');
  });
  
  it(`should reflect parent model changes`,() => {
  
      const {compiledElement, ctrl} = render(TestComponent);
          
      // now we need to get our tested component
      const {debugElement,componentInstance} = queryByDirective(compiledElement,MyComponent);
      
      // now change ngModel reference
      ctrl.name = 'Igor';
      
      $rootScope.$digest();
      
      expect(componentInstance.greeting).to.equal('Igor');
      expect(debugElement.text()).to.equal('hello Igor!');
          
  });
  
});

// helper - this will be implemented to ng-metadata in next release
function queryByDirective<T extends Type>( host: ng.IAugmentedJQuery, Type: T ) {
  const ctrlName = getInjectableName( Type );
  const selector = lodash.kebabCase( ctrlName );
  const debugElement = host.find( selector );
  const componentInstance = debugElement.controller( ctrlName ) as T;

  return { debugElement, componentInstance };
}
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
