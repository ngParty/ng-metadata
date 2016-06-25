# Class

- [EventEmitter](#eventemitter)
- [OpaqueToken](#opaquetoken)

**Local Injectables**

These services can be only injected from Component/Directive

These are not singletons, every component/directive owns it's own instance of the service

- [ChangeDetectorRef](#changedetectorref)


---

## EventEmitter

Use by directives and components to emit custom Events via `@Output` binding.
> Under the hood operates under the `&` binding but mitigates the pain of passing `{locals}` to the callback

###### members

| members       | Type                            | Description                                  |
| ------------- | ------------------------------- |--------------------------------------------- |
| **emit**      | `(value: T): void`              | emits defined event to parent with provided value, this value is encapsulated in `$event` from within template |
| **subscribe** | `(next?: Function) : Function`  | abstraction of real observable `subscription`, just works as pubSub and returns dispose callback, Do not use this! |

**Note:**
This is not Rx `Subject`, it's just an abstraction
  
**Note 2:**
Never call emitter instance methods within constructor, because the `&` binding is wrapped within EventEmitter during class instantiation.
Instead use `OnInit` phase which you should use anyway for all startup logic.
- This will be resolved in ngMetadata `2.0` where it will be already emitter instance

**Pure Interface usage:**
- if you don't preffer to assign `@Output` to new EventEmitter, isntead you can use just interface like `@Output() callUser: EventEmitter<UserModel>`
-- this is here for migration reasons from traditional callbacks. 
-- Under the hood we add proper `emit` to angular `&` binding, but preferabble is assigning `new EventEmitter`
-- so this way you can call `@Output() callUser: EventEmitter<UserModel>` later in code like `doSomething(){ this.callUser.emit({name:'martin'}) }`
or traditionaly with confusing angular locals `doSomething(){ this.callUser({user:{name:'martin'}}) }`

*example:*

In the following example, Zippy alternatively emits open and close events when its title gets clicked

```typescript
// app.component.ts
import {Component} from 'ng-metadata/core';

@Component({
  selector:'app',
  template:`<zippy open="$ctrl.onOpen($event)" "$ctrl.onClose($event)"></zippy>`,
  directives: [ZippyComponent]
})
class AppComponent {

  onOpen(zippyVisible: boolean){
    console.log(`zippy visibility is: {zippyVisible}`);
  }
  onClose(zippyVisible: boolean){
    console.log(`zippy visibility is: {zippyVisible}`);
  }
}

// zipy.component.ts
import {Component, Output, EventEmitter} from 'ng-metadata/core';

@Component({
  selector: 'zippy',
  template: `
    <div class="zippy">
      <div ng-click="$ctrl.toggle()">Toggle</div>
      <div ng-hide="!$ctrl.visible">
        <ng-transclude></ng-transclude>
      </div>
    </div>`
})
export class ZippyComponent {
  visible: boolean = true;
  
  @Output() open = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<boolean>();
  
  toggle() {
    this.visible = !this.visible;
    if (this.visible) {
      this.open.emit(this.visible);
    } else {
      this.close.emit(this.visible);
    }
  }
}

// index.ts
import * as angular from 'angular';
import {provide} from 'ng-metadata/core';
import {AppComponent} from './app.component';
import {ZippyComponent} from './zippy.component';

export ngModule = angular.module('myApp',[])
  .directive(...provide(AppComponent))
  .directive(...provide(ZippyComponent))
  .name;
```


## OpaqueToken

Creates a token that can be used in a DI Provider.

Using an OpaqueToken is preferable to using strings as tokens because of possible collisions caused by multiple providers using the same string as two different tokens.

*example:*

```typescript
import * as angular from 'angular';
import {OpaqueToken, provide, getInjectableName} from 'ng-metadata/core';

const key = new OpaqueToken("value");
const someConstant = 'Dont change me DI!';

angular.module('myApp',[])
  .constant(...provide(key,{useValue:someConstant}));

// test.ts
import {expect} from 'chai';
var $injector = angular.injector(['ng','myApp']);

expect($injector.get(getInjectableName(key))).to.equal('Dont change me DI!');
```

---

## ChangeDetectorRef

Can be used for custom change detection controll, which can bring us various performance benefits 

###### members

Note: by change detector, we mean in Angular 1 terms, local component `$scope`

| members           | Type       | Description                                  |
| ----------------- | ---------- |--------------------------------------------- |
| **markForCheck**  | `Function` | Marks all ancestors to be checked. ( calls `$scope.$applyAsync()` ) |
| **detectChanges** | `Function` | Checks the change detector and its children. ( calls `$scope.$digest()` ). This can also be used in combination with `detach` to implement local change detection checks. |
| **detach**        | `Function` | Detaches the change detector from the change detector tree. The detached change detector($scope) will not be checked until it is reattached. |
| **reattach**      | `Function` | Reattach the change detector to the change detector tree |

All of following examples can be seen live in [playground](https://github.com/ngParty/ng-metadata/tree/master/playground/app/components/change-detector/change-detector.component.ts) ( clone project, npm install, npm run playground, open localhost:8080/playground )

*example:*

This example showcases `markForCheck`. We are using window.setInterval which won't notify angular about changes.
With ChangeDetectorRef, we can mitigate this problem pretty easily:

```typescript
import * as angular from 'angular';
import {
  provide,
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  Input
} from 'ng-metadata/core';
import { bootstrap } from 'ng-metadata/platform';

@Component( {
  selector: 'mark-for-check',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `Number of ticks inside child: {{ $ctrl.ticks }}`
} )
export class MarkForCheckComponent implements OnInit {
  @Input() ticks;

  constructor( private ref: ChangeDetectorRef ) {}

  ngOnInit() {
    setInterval( () => {
      this.ticks++;
      // the following is required, otherwise the view and parent component will not be updated
      this.ref.markForCheck();
      // if we call instead detectChanges, only view and children will be updated
      // this.ref.detectChanges();
    }, 1000 );
  }

}

@Component( {
  selector: 'app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    Number of ticks inside parent: {{ $ctrl.numberOfTicks }}
    <mark-for-check ticks="$ctrl.numberOfTicks"></mark-for-check>
  `,
  directives: [ MarkForCheckComponent ]
} )
export class AppComponent {
  numberOfTicks = 0;
}

const AppModule = angular.module('myApp',[])
  .directive(...provide(AppComponent))
  .directive(...provide(MarkForCheckComponent))
  .name;
  
bootstrap(AppModule);
```

*example:*

The following example defines a component with a large list of readonly data.

Imagine the data changes constantly, many times per second. For performance reasons,
we want to check and update the list every five seconds. We can do that by detaching
the component's change detector and doing a local check every five seconds.
   
```typescript
import * as angular from 'angular';
import {
  provide,
  Component,
  Injectable,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from 'ng-metadata/core';
import { bootstrap } from 'ng-metadata/platform';

@Injectable()
export class DataProvider {
  private _data = [ 1, 2, 3 ];
  private _interval;

  constructor(){
    setInterval(()=>{
      this._data = [...this._data,...this._data.slice(-2).map(num=>num*2)];
    },3000);
  }
  // in a real application the returned data will be different every time
  get data() {
    return this._data;
  }

}

@Component( {
  selector: 'detach',
  template: `
    <li ng-repeat="d in $ctrl.dataProvider.data track by $index">Data {{d}}</li>
  `
} )
export class DetachComponent {
  constructor( private ref: ChangeDetectorRef, private dataProvider: DataProvider ) {
    ref.detach();
    setInterval( () => {
      this.ref.detectChanges();
    }, 5000 );
  }
}

@Component( {
  selector: 'app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `   
   <detach></detach>
  `,
  providers: [ DataProvider ],
  directives: [ DetachComponent ]
} )
export class AppComponent {}

const AppModule = angular.module('myApp',[])
  .directive(...provide(AppComponent))
  .directive(...provide(DetachComponent))
  .service(...provide(DataProvider))
  .name;
  
bootstrap(AppModule);
```

*example:*

The following example creates a component displaying `live` data. The component will detach
its change detector from the main change detector tree when the component's live property
is set to false.

```typescript
import * as angular from 'angular';
import {
  provide,
  Component,
  Injectable,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from 'ng-metadata/core';
import { bootstrap } from 'ng-metadata/platform';

@Injectable()
export class DataProvider {
  data = 1;

  constructor() {
    setInterval( () => {
      this.data = this.data * 2;
    }, 2500 );
  }
}

@Component( {
  selector: 'reattach',
  template: `Data: {{$ctrl.dataProvider.data}}`
} )
export class ReattachComponent implements OnChanges {

  @Input( '<' ) live: boolean;

  constructor( private ref: ChangeDetectorRef, private dataProvider: DataProvider ) {}

  ngOnChanges( changes ) {
    const liveChange = changes.live as SimpleChange;
    if ( liveChange ) {
      if ( liveChange.currentValue ) {
        this.ref.reattach();
      } else {
        this.ref.detach();
      }
    }
  }

}

@Component( {
  selector: 'app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `   
    Live Update: <input type="checkbox" ng-model="$ctrl.live">
    <reattach live="$ctrl.live"></reattach>
  `,
  providers: [ DataProvider ],
  directives: [ ReattachComponent ]
} )
export class AppComponent {
  live = true;
}

const AppModule = angular.module('myApp',[])
  .directive(...provide(AppComponent))
  .directive(...provide(ReattachComponent))
  .service(...provide(DataProvider))
  .name;
  
bootstrap(AppModule);
```
