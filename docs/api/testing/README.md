# ng-metadata/testing

**Service Testing**

For exemple with these service : 
```typescript
@Injectable('heroService')
export class HeroService {
  constructor(@Inject('$http') private $http: ng.IHttpService) {}
  
  getHeroes() {
    return this.$http.get('api/heros').then((heroes: Hero[]) =>{
      return response.data as Documentation;
    });
  }
```

Testing : 
```typescript
describe('Hero service test', () => {
  let heroService: HeroService;
  let $httpBackend;
  
  beforeEach(() => {
    const TestModule: string = bundle(HeroService).name;
    angular.mock.module(TestModule);
    
    $httpBackend = $injector.get<IHttpBackendService>('$httpBackend');
    heroService = $injector.get<HeroService>(getInjectableName(HeroService));
  });
  
  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
  
  it('should get heroes collection', () => {
    const heroes = [{
      name: 'superman'
    }];
    $httpBackend.expectGET('api/heroes').respond(heroes);
    const result = heroService.getHeroes();
    
    $httpBackend.flush();
    
    expect(result).toEqual(heroes);
  });
});
```

**Component Testing**

For example with these components : 
```typescript
@Component({
  selector: 'sub-component',
  template: 'hello ! '})
class SubComponent {}

@Component({
  selector: 'component',
  template: '<sub-component></sub-component>',
  directives: [SubComponent]
})
class ParentComponent {}
```

We have a parent component witch have a child.
we just want to test the parent, we don't want to care about the child implementation.
For exemple if the child does AJAX request on initialisation, we don't want to catch them when we test the parent.

To test that we must do : 
```typescript
describe('Parent component test', () => {
  let $rootScope: IRootScopeService;
  let $compile: ICompileService;
  let $scope: IScopeService;
  let render: IRender;
  
  beforeEach(() => {
    const TestModule: string = bundle(ParentComponent).name;
    angular.mock.module(TestModule, ($provide) => {
      $provide.decorator(getInjectableName(SubComponent), ($delegate) => ({restrict: 'EA', controller: angular.noop, template: 'hello mock'});
    });
    
    $compile = $injector.get<ng.ICompileService>('$compile');
    $rootScope = $injector.get<ng.IRootScopeService>('$rootScope');
    $scope = $rootScope.$new();

    render = renderFactory( $compile, $scope );
  });
  
  it('test', inject(($injector: ng.auto.IInjectorService) => {
    let context = render(FirstComponent); // contain <current instance of ParentComponent controler> and <the DOM element>
    expect(context.ctrl).toBeDefined();
  }));
}));
```

**Ps : the important part here to mock component children is the '$provide.decorator'. **
We can use that to mock directive (take care of the restrict: 'EA' property)
