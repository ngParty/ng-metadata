<a name="4.0.1"></a>
## [4.0.1](https://github.com/ngParty/ng-metadata/compare/4.0.0...v4.0.1) (2016-12-25)


### Bug Fixes

* **common/async_pipe:** return immediately every value if it exist in subscriptions ([189770e](https://github.com/ngParty/ng-metadata/commit/189770e)), closes [#187](https://github.com/ngParty/ng-metadata/issues/187)



<a name="4.0.0"></a>
# [4.0.0](https://github.com/ngParty/ng-metadata/compare/3.0.3...v4.0.0) (2016-12-24)


### Bug Fixes

* **build:** create angular typings override so we don't have to import them to source ([3153bca](https://github.com/ngParty/ng-metadata/commit/3153bca)), closes [#175](https://github.com/ngParty/ng-metadata/issues/175) [#177](https://github.com/ngParty/ng-metadata/issues/177)
* **core/directives/host:** execute HostListener method within sync $apply instead of next tick ([96bf124](https://github.com/ngParty/ng-metadata/commit/96bf124)), closes [#171](https://github.com/ngParty/ng-metadata/issues/171)
* **facade/lang:** support Node 6 and Windows environments (#182) ([821b772](https://github.com/ngParty/ng-metadata/commit/821b772))
* **playground:** add new angular-extensions and fix provide errors ([81217cf](https://github.com/ngParty/ng-metadata/commit/81217cf))

### Features

* **packages:** update to rxjs@5.0.1 and unpin the rxjs peerDeps via ^5.0.1. Also move to stable ([2ea1299](https://github.com/ngParty/ng-metadata/commit/2ea1299)), closes [#185](https://github.com/ngParty/ng-metadata/issues/185)
* **playground:** add example for preventing user input via directive HostListener ([947078c](https://github.com/ngParty/ng-metadata/commit/947078c))
* **upgrade:** add support for AOT via '@angular/upgrade/static' api ([3d3f724](https://github.com/ngParty/ng-metadata/commit/3d3f724)), closes [#178](https://github.com/ngParty/ng-metadata/issues/178)


### BREAKING CHANGES

* build: We now officialy support only angular typings provided via npm `@types/*` and also typescript 2.x

- your existing typings provided by `typings` might not work
- from now on if you wanna use deprecated `provide` function from `ng-metadata/core` with registration within `angular.module().directive|service|filter` you have to explicitly include angular types extension provided by ng-metadata from `node_modules/ng-metadata/manual_typings/angular-extension.d.ts`

Before:
```typescript
// global.d.ts
/// <reference path="../node_modules/ng-metadata/manual_typings/globals.d.ts" />
```

After:
```typescript
/// <reference path="../node_modules/ng-metadata/manual_typings/angular-extension.d.ts" />
```

or you can include it from within your tsconfig.json like this:
```json
{
  "include":[
    "src/**/*.ts"
  ],
  "files": [
    "node_modules/ng-metadata/manual_typings/angular-extension.d.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```



<a name="3.0.3"></a>
## [3.0.3](https://github.com/ngParty/ng-metadata/compare/3.0.2...v3.0.3) (2016-11-07)


### Bug Fixes

* **manual_typings/globals:** remove Type alias from globals and add it to every module which relies on it ([9040a2c](https://github.com/ngParty/ng-metadata/commit/9040a2c)), closes [#170](https://github.com/ngParty/ng-metadata/issues/170)



<a name="3.0.2"></a>
## [3.0.2](https://github.com/ngParty/ng-metadata/compare/3.0.1...v3.0.2) (2016-10-21)


### Bug Fixes

* **npm:** remove reflect-metadata from peerDependencies as user can use core-js or other polyfill ([0ba808c](https://github.com/ngParty/ng-metadata/commit/0ba808c))



<a name="3.0.1"></a>
## [3.0.1](https://github.com/ngParty/ng-metadata/compare/3.0.0...v3.0.1) (2016-10-20)


### Bug Fixes

* **manual_typings:** make custom global angular overrides work with both global and module type defin ([3eb047d](https://github.com/ngParty/ng-metadata/commit/3eb047d))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/ngParty/ng-metadata/compare/3.0.0-beta.0...v3.0.0) (2016-10-20)


### Bug Fixes

* **core:** Fix typo in bundle error message, relax isNgModule check (fixes #155) (#159) ([52fa571](https://github.com/ngParty/ng-metadata/commit/52fa571)), closes [#155](https://github.com/ngParty/ng-metadata/issues/155) [(#159](https://github.com/(/issues/159)

### Features

* **upgrade:** Dedicated NgMetadataUpgradeAdapter bootstrap function (#160) ([f941c71](https://github.com/ngParty/ng-metadata/commit/f941c71))


### BREAKING CHANGES

* The rxjs peerDependency has been updated to 5.0.0-rc.1, and this in turn requires TypeScript of 2.x and above.



<a name="3.0.0-beta.0"></a>
# [3.0.0-beta.0](https://github.com/ngParty/ng-metadata/compare/2.2.1...v3.0.0-beta.0) (2016-09-20)


### Features

* **core:** Add NgModule, use it for angular1Module bundling ([ed1c326](https://github.com/ngParty/ng-metadata/commit/ed1c326))
* **core:** Remove directives and pipes from ComponentMetadata ([ed1ca46](https://github.com/ngParty/ng-metadata/commit/ed1ca46))
* **playground:** add NgModule type and update bootstrap defs ([9a176d4](https://github.com/ngParty/ng-metadata/commit/9a176d4))
* **upgrade:** Update NgMetadataUpgradeAdapter to support NgModule ([0a81c13](https://github.com/ngParty/ng-metadata/commit/0a81c13))


### BREAKING CHANGES

* core: All Pipes and Components must now be registered via an NgModule's declarations array.

**Before:**
```typescript
import { Component, Pipe } from 'ng-metadata/core'

@Component({
  selector: 'feature'
})
class FeatureComponent {}

@Pipe()
class FooPipe {
  transform() {
    return 'foo'
  }
}

@Component({
  selector: 'main',
  directives: [FeatureComponent],
  pipes: [FooPipe]
})
class MainComponent {}
```

**After:**
```typescript
import { NgModule, Component, Pipe } from 'ng-metadata/core'

@Component({
  selector: 'feature'
})
class FeatureComponent {}

@Pipe()
class FooPipe {
  transform() {
    return 'foo'
  }
}

@Component({
  selector: 'main'
})
class MainComponent {}

@NgModule({
  declarations: [MainComponent, FooPipe]
})
class MainModule {}
```
* upgrade: NgMetadataUpgradeAdapter now accepts an already
instantiated @angular/upgrade UpgradeAdapter, which will have been
created using an Angular 2 NgModule.

**Before:**
```typescript
import { NgMetadataUpgradeAdapter } from 'ng-metadata/upgrade'
import { UpgradeAdapter } from '@angular/upgrade'
import { Component } from 'ng-metadata/core'

const angular1Module = angular.module('ng1Module', [])

@Component({
  selector: 'app'
})
class AppComponent {}

const upgradeAdapter = new NgMetadataUpgradeAdapter(UpgradeAdapter)

upgradeAdapter.bootstrap(AppComponent, ['ng1Module'])
```

**After:**
```typescript
import { NgMetadataUpgradeAdapter } from 'ng-metadata/upgrade'
import { UpgradeAdapter } from '@angular/upgrade'
import { NgModule } from '@angular/core'

const angular1Module = angular.module('ng1Module', [])

@NgModule({
  selector: 'ng2'
})
class Ng2Module {}

const upgradeAdapter = new NgMetadataUpgradeAdapter( new
UpgradeAdapter(Ng2Module) )

upgradeAdapter.boostrap(document.body, ['ng1Module'])
```
* core: bundle() now takes an NgModule decorated class as its
first argument instead of a Component.

**Before:**
```typescript
import { Component, bundle } from 'ng-metadata/core'

@Component({
  selector: 'foo',
  template: '<h1>Foo!</h1>'
})
class FooComponent {}

const angular1Module = bundle(FooComponent)
```

**After:**
```typescript
import { NgModule, Component, bundle } from 'ng-metadata/core'

@Component({
  selector: 'foo',
  template: '<h1>Foo!</h1>'
})
class FooComponent {}

@NgModule({
  declarations: [FooComponent]
})
class FooModule {}

const angular1Module = bundle(FooModule)
```
* core: bootstrapping is now done on an NgModule, not on a
Component.

**Before:**
```typescript
import { bootstrap } from 'ng-metadata/platform-browser-dynamic'
import { Component } from 'ng-metadata/core'

@Component({
  selector: 'app'
})
class AppComponent {}

bootstrap(AppComponent)
```

**After:**
```typescript
import { platformBrowserDynamic } from 'ng-metadata/platform-browser-dynamic'
import { NgModule, Component } from 'ng-metadata/core'

@Component({
  selector: 'app'
})
class AppComponent {}

@NgModule({
  declarations: [AppComponent]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule)
```



<a name="2.2.1"></a>
## [2.2.1](https://github.com/ngParty/ng-metadata/compare/2.2.0...v2.2.1) (2016-09-16)


### Bug Fixes

* **core/directives/directive_utils#_setupDestroyHandler:** remove element.off() on scope  event (#145) ([cbc2e20](https://github.com/ngParty/ng-metadata/commit/cbc2e20)), closes [#143](https://github.com/ngParty/ng-metadata/issues/143)
* **testing:** Add a check on attributes before assigning to element i… (#137) ([cbb245d](https://github.com/ngParty/ng-metadata/commit/cbb245d)), closes [#136](https://github.com/ngParty/ng-metadata/issues/136)



<a name="2.2.0"></a>
# [2.2.0](https://github.com/ngParty/ng-metadata/compare/2.1.1...v2.2.0) (2016-08-30)


### Bug Fixes

* **core/di/reflective_provider:** allow boolean false value as useValue provider value (#134) ([f4e583e](https://github.com/ngParty/ng-metadata/commit/f4e583e)), closes [#123](https://github.com/ngParty/ng-metadata/issues/123)
* **core/directives/ng_form:** add $name property (#130) ([f2c28d0](https://github.com/ngParty/ng-metadata/commit/f2c28d0)), closes [#127](https://github.com/ngParty/ng-metadata/issues/127)

### Features

* **core/directives:** explicitly set restriction type for Directive/Component to A/E (#132) ([e0af65d](https://github.com/ngParty/ng-metadata/commit/e0af65d)), closes [#128](https://github.com/ngParty/ng-metadata/issues/128)



<a name="2.1.1"></a>
## [2.1.1](https://github.com/ngParty/ng-metadata/compare/2.1.0...v2.1.1) (2016-07-15)


### Bug Fixes

* **upgrade:** fix adapter export and typo in docs (#120) ([3c59319](https://github.com/ngParty/ng-metadata/commit/3c59319)), closes [#120](https://github.com/ngParty/ng-metadata/issues/120)



<a name="2.1.0"></a>
# [2.1.0](https://github.com/ngParty/ng-metadata/compare/2.0.0...v2.1.0) (2016-07-13)


### Features

* **upgrade:** add ngUpgrade integration support (#116) ([cdc86dc](https://github.com/ngParty/ng-metadata/commit/cdc86dc)), closes [#83](https://github.com/ngParty/ng-metadata/issues/83)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/ngParty/ng-metadata/compare/1.12.4...v2.0.0) (2016-06-26)


### Bug Fixes

* **playground/async-example:** add this to async observable ([5ad67ec](https://github.com/ngParty/ng-metadata/commit/5ad67ec))

### Features

* **common/pipes/async_pipe:** implement async pipe for $q and RxJS 5 observables ([ca7a84c](https://github.com/ngParty/ng-metadata/commit/ca7a84c)), closes [#98](https://github.com/ngParty/ng-metadata/issues/98)
* **core/di:** add support for useFactory and reflective provider with utils for supporting pro ([253a986](https://github.com/ngParty/ng-metadata/commit/253a986))
* **core/di:** make resolving component tree code DRY and add support for registering config ph ([272e22a](https://github.com/ngParty/ng-metadata/commit/272e22a))
* **core/di/reflective_provider:** add helper method for registering annotated Types ([03d9f52](https://github.com/ngParty/ng-metadata/commit/03d9f52))
* **core/directives:** add moduleId support for ComponentMetadata ([f438de6](https://github.com/ngParty/ng-metadata/commit/f438de6)), closes [#96](https://github.com/ngParty/ng-metadata/issues/96)
* **core/directives:** apply fixes/changes from latest angular1.x $compile ([7fd66c5](https://github.com/ngParty/ng-metadata/commit/7fd66c5))
* **core/directives/binding:** implement binding determined by template ([6071a5f](https://github.com/ngParty/ng-metadata/commit/6071a5f))
* **core/directives/binding|controller:** allow @Output only as instance of EventEmitter ([4fad19a](https://github.com/ngParty/ng-metadata/commit/4fad19a))
* **core/util:** add bundler helper for collecting DI Tree via components ([ea6ce56](https://github.com/ngParty/ng-metadata/commit/ea6ce56))
* **core/util/bundler:** clean code and support nested arrays resolution ([80608ed](https://github.com/ngParty/ng-metadata/commit/80608ed))
* **facade:** add flatten capabilities to ListWrapper ([ac5e5e4](https://github.com/ngParty/ng-metadata/commit/ac5e5e4))
* **facade/async:** make EventEmitter real emitter - superclass of Rx/Subject ([3550eff](https://github.com/ngParty/ng-metadata/commit/3550eff))
* **platform:** rename platform to platform-browser-dynamic to follow Angular 2 module namespace ([95e209c](https://github.com/ngParty/ng-metadata/commit/95e209c))
* **platform/browser:** use bundler for bootstrap ([88479a5](https://github.com/ngParty/ng-metadata/commit/88479a5))
* **playground:** add async pipe example ([ffd35bf](https://github.com/ngParty/ng-metadata/commit/ffd35bf))
* **playground:** add attribute directive example ([bf8409f](https://github.com/ngParty/ng-metadata/commit/bf8409f))
* **playground:** add config function, factory, dynamic providers registration via config example ([916118e](https://github.com/ngParty/ng-metadata/commit/916118e))
* **playground:** use new bootstrap and move todo to feature folder ([b3da28b](https://github.com/ngParty/ng-metadata/commit/b3da28b))
* **playground:** use new ng2 like template binding syntax instead of using @Input string type ([225fb2e](https://github.com/ngParty/ng-metadata/commit/225fb2e))
* **playground:** use relative paths with moduleId where templateUrl is used ([afe32d0](https://github.com/ngParty/ng-metadata/commit/afe32d0))


### BREAKING CHANGES

* platform: before you imported bootstrap and Title from `ng-metadata/platform`.
now the endpoint has changed to `ng-metadata/platform-browser-dynamic`
* core/directives/binding|controller: S:

before:

in 1.x you could use just function callback or instance of event emitter fo @Output bindings.

```typescript
@Component({selector:'clicker',template:'..'})
class ClickerComponent{
  @Output() clickMe: ()=>void = angular.noop;
  doSomething(){
    this.clickMe();
  }
}
```

after:

now you have to explicitly use instance of event emitter otherwise it won't work
```typescript
@Component({selector:'clicker',template:'..'})
class ClickerComponent{
  @Output() clickMe = new EventEmitter<void>();
  doSomething(){
     this.clickMe.emit();
  }
}
```

* platform/browser: S:

You have to bootstrap your app via root component like Angular 2 does.
This is because we use now tree resolving algorithm for building Angular.module

before:
```typescript
import {bootstrap} from 'ng-metadata/platform';
import {AppModule} from './index'; // string

bootstrap(AppModule);
```

after:
```typescript
import {bootstrap} from 'ng-metadata/platform';
import {LegacyModule} from './index'; // string
import {AppComponent} from './index'; // class with @Component decorator

bootstrap(AppComponent, [LegacyModule]);
```



<a name="1.12.4"></a>
## [1.12.4](https://github.com/ngParty/ng-metadata/compare/1.12.3...v1.12.4) (2016-06-25)


### Bug Fixes

* **core/directives/host:** correctly handle return value in @HostListener for calling preventDefault (#109) ([fe33427](https://github.com/ngParty/ng-metadata/commit/fe33427)), closes [#108](https://github.com/ngParty/ng-metadata/issues/108)



<a name="1.12.3"></a>
## [1.12.3](https://github.com/ngParty/ng-metadata/compare/1.12.2...v1.12.3) (2016-06-24)


### Bug Fixes

* **core/directives:** fix wrong rebound output when directive has requires (#107) ([1b008a8](https://github.com/ngParty/ng-metadata/commit/1b008a8)), closes [(#107](https://github.com/(/issues/107) [#106](https://github.com/ngParty/ng-metadata/issues/106)



<a name="1.12.2"></a>
## [1.12.2](https://github.com/ngParty/ng-metadata/compare/1.12.1...v1.12.2) (2016-06-03)


### Bug Fixes

* **testing:** remove `Type` constraint from generic type to make TS happy ([3f1dc9d](https://github.com/ngParty/ng-metadata/commit/3f1dc9d))



<a name="1.12.1"></a>
## [1.12.1](https://github.com/ngParty/ng-metadata/compare/1.12.0...v1.12.1) (2016-06-02)


### Bug Fixes

* **testing:** tweak IRender type definition to properly propagate generic type (#92) ([3a6372a](https://github.com/ngParty/ng-metadata/commit/3a6372a))



<a name="1.12.0"></a>
# [1.12.0](https://github.com/ngParty/ng-metadata/compare/1.11.1...v1.12.0) (2016-05-30)


### Features

* **core/directives:** add support for ngComponentRouter with ng1 method names ([393f440](https://github.com/ngParty/ng-metadata/commit/393f440))
* **core/linker:** add SimpleChanges type to lifecycle_interfaces to simplify OnChanges signature ( ([67ea144](https://github.com/ngParty/ng-metadata/commit/67ea144))
* **platform/title:** backport and add Title service ([2c2bb11](https://github.com/ngParty/ng-metadata/commit/2c2bb11))
* **playground:** add title handling example ([53af10f](https://github.com/ngParty/ng-metadata/commit/53af10f))
* **router-deprecate:** add ROUTER_PRIMARY_COMPONENT opaque token to be able to register rootComponent w ([9b9ab44](https://github.com/ngParty/ng-metadata/commit/9b9ab44))
* **router-deprecated:** add router-deprecated module which backports @angular/router-deprecated API ([2aa0702](https://github.com/ngParty/ng-metadata/commit/2aa0702))



<a name="1.11.1"></a>
## [1.11.1](https://github.com/ngParty/ng-metadata/compare/1.11.0...v1.11.1) (2016-05-22)


### Bug Fixes

* **manual_typings:** explicitly annotate all arguments in Watchers interface methods (#86) ([7649847](https://github.com/ngParty/ng-metadata/commit/7649847)), closes [#72](https://github.com/ngParty/ng-metadata/issues/72)
* **playground:** fix wrong tsconfig.json ([7ea64b0](https://github.com/ngParty/ng-metadata/commit/7ea64b0))



<a name="1.11.0"></a>
# [1.11.0](https://github.com/ngParty/ng-metadata/compare/1.10.0...v1.11.0) (2016-05-10)


### Bug Fixes

* **playground:** fix DoChanges example binding ([2cb8ff4](https://github.com/ngParty/ng-metadata/commit/2cb8ff4))

### Features

* **core/directives/directive_provider:** allow AfterViewInit/AfterViewChecked lc for @Directive ([6a9fe6e](https://github.com/ngParty/ng-metadata/commit/6a9fe6e))
* **core/directives/util:** notify user to refactor their @Input bindings for easy upgrade to 2.0 ([65e1d3d](https://github.com/ngParty/ng-metadata/commit/65e1d3d))
* **playground:** add AfterContentInit/Checked docs demos ([b47610b](https://github.com/ngParty/ng-metadata/commit/b47610b))
* **playground:** add AfterViewInit/Checked docs demos ([46bffa7](https://github.com/ngParty/ng-metadata/commit/46bffa7))

This contains few tweaks to codebase and **preparation for breaking changes in 2.0**

## IMPORTANT
- you will get `console.warning` if you are using two way binding by default `@Input() myTwoWay`
- fix is very easy, just global replace `@Input() myTwoWay` to `@Input('=') myTwoWay`
- this is included so you'll be prepared for ngMetadata 2.0 which will determine binding from your template if you'll use `@Input() binding` without setting explicit mode, or by setting explicit mode

in ngMetadata 2.0 you will have two options to define type of your bindings:

### 1. From template ( preferred )
```html
<my-cmp 
  inter="{{$ctrl.foo}}" 
  [data]="$ctrl.values" 
  [(two-way)]="$ctrl.problems" 
  (notify)="$ctrl.doSomething()"
></my-cmp>
```
```typescript
@Component({ selector: 'my-cmp', template: '....'})
class MyComponent{
  @Input() inter: string;  // determined that this is '@' type
  @Input() data: { name: string, age: number }; // determined that this is '<' type
  @Input() twoWay: { name: string, age: number }; // determined that this is '<= type
  @Output() notify = new EventEmitter<any>();
}
```

### 2. Defined by user from Input ( deprecated, but still there till you migrate )
```html
<my-cmp 
  inter="{{$ctrl.foo}}" 
  data="$ctrl.values" 
  two-way="$ctrl.problems" 
  notify="$ctrl.doSomething()"
></my-cmp>
```
```typescript
@Component({ selector: 'my-cmp', template: '....'})
class MyComponent{
  @Input('@') inter: string;  // explicitly set type
  @Input('<') data: { name: string, age: number };  // explicitly set type
  @Input('=') twoWay: { name: string, age: number }; // explicitly set type
  @Output() notify = new EventEmitter<any>();
}
```

**NOTE:** you  cannot mix those two for one component


<a name="1.10.0"></a>
# [1.10.0](https://github.com/ngParty/ng-metadata/compare/1.9.1...v1.10.0) (2016-05-08)


### Features

* **core/change_detection:** implement ChangeDetectorRef ([a7e3d6f](https://github.com/ngParty/ng-metadata/commit/a7e3d6f))
* **core/change_detection:** properly inject ChangeDetectorRef as local dependency to component/directive ([3be07ad](https://github.com/ngParty/ng-metadata/commit/3be07ad))
* **core/di:** allow to explicitly set services name by @Injectable('yourExplicitName') ([49f6e7b](https://github.com/ngParty/ng-metadata/commit/49f6e7b))
* **core/directives/directive_provider:** implement DoCheck/ngDoCheck lc hook ([3ed1bbd](https://github.com/ngParty/ng-metadata/commit/3ed1bbd))
* **playground:** add ChangeDetectorRef docs examples and update type definitions ([e932aca](https://github.com/ngParty/ng-metadata/commit/e932aca))
* **playground:** add lifecycle hooks docs examples and update type definitions ([5979336](https://github.com/ngParty/ng-metadata/commit/5979336))



<a name="1.9.1"></a>
## [1.9.1](https://github.com/ngParty/ng-metadata/compare/1.9.0...v1.9.1) (2016-05-06)


### Bug Fixes

* **core/directives/directive_provider:** fix regexp to allow more attributes within @HostListener (#78) ([92bd0a3](https://github.com/ngParty/ng-metadata/commit/92bd0a3)), closes [(#78](https://github.com/(/issues/78)



<a name="1.9.0"></a>
# [1.9.0](https://github.com/ngParty/ng-metadata/compare/1.8.0...v1.9.0) (2016-04-30)


### Features

* **change_detection:** implement changeDetection strategy for components ([2d9cd2b](https://github.com/ngParty/ng-metadata/commit/2d9cd2b))



<a name="1.8.0"></a>
# [1.8.0](https://github.com/ngParty/ng-metadata/compare/1.7.2...v1.8.0) (2016-04-27)


### Features

* **core/directives:** process EventEmitter for `&` bindings or extend existing function ([9c6170e](https://github.com/ngParty/ng-metadata/commit/9c6170e))
* **facade/async:** create EventEmitter ([131b093](https://github.com/ngParty/ng-metadata/commit/131b093))
* **facade/async:** fully typed EventEmitter + EventHandler ([0dab5a7](https://github.com/ngParty/ng-metadata/commit/0dab5a7))
* **playground:** add examples with EventEmitter ([c977ff5](https://github.com/ngParty/ng-metadata/commit/c977ff5))



<a name="1.7.2"></a>
## [1.7.2](https://github.com/ngParty/ng-metadata/compare/1.7.1...v1.7.2) (2016-04-27)


### Bug Fixes

* **manual_typings:** Add boolean type annotation to expensiveChecks  ([b684510](https://github.com/ngParty/ng-metadata/commit/b684510)), closes [#73](https://github.com/ngParty/ng-metadata/issues/73)



<a name="1.7.1"></a>
## [1.7.1](https://github.com/ngParty/ng-metadata/compare/1.7.0...v1.7.1) (2016-04-25)


### Bug Fixes

* **core/directives:** Ensure watchers are functions (#70) ([c4f83d3](https://github.com/ngParty/ng-metadata/commit/c4f83d3)), closes [#69](https://github.com/ngParty/ng-metadata/issues/69)



<a name="1.7.0"></a>
# [1.7.0](https://github.com/ngParty/ng-metadata/compare/1.6.1...v1.7.0) (2016-04-24)


### Bug Fixes

* **playground:** update HostListener type definition ([5d44b9d](https://github.com/ngParty/ng-metadata/commit/5d44b9d))

### Features

* **core/directives:** add global target support for @HostListener ([4af3f69](https://github.com/ngParty/ng-metadata/commit/4af3f69))
* **playground:** add examples with global hostListeners ([0058df9](https://github.com/ngParty/ng-metadata/commit/0058df9))



<a name="1.6.1"></a>
## [1.6.1](https://github.com/ngParty/ng-metadata/compare/1.6.0...v1.6.1) (2016-04-24)


### Bug Fixes

* **core/directives:** properly clean up bindings on destroy (#67) ([cb46729](https://github.com/ngParty/ng-metadata/commit/cb46729))



<a name="1.6.0"></a>
# [1.6.0](https://github.com/ngParty/ng-metadata/compare/1.5.2...v1.6.0) (2016-04-18)


### Bug Fixes

* **platform/bootstrap:** correctly use strictDi param when bootstrapping ngMetadata app (#62) ([361f509](https://github.com/ngParty/ng-metadata/commit/361f509))

### Features

* **core:** implement enableProdMode functionality (#61) ([59cd7d2](https://github.com/ngParty/ng-metadata/commit/59cd7d2))



<a name="1.5.2"></a>
## [1.5.2](https://github.com/ngParty/ng-metadata/compare/1.5.1...v1.5.2) (2016-04-16)


### Features

* **platform/bootstrap:** use bootstrap with module name instead of n… (#60) ([34d510a](https://github.com/ngParty/ng-metadata/commit/34d510a))


### BREAKING CHANGES

* platform/bootstrap: - you need to export .name from your registered module.
- This brings consistency across the whole app, because it's by default that Angular 1 exports module names for consumer and this is also aligned with ngUpgrade

before:
```typescript
import { provide, Component } from 'ng-metadata/core';
import { bootstrap } from 'ng-metadata/platform';

@Component({ selector: 'app', template: 'Hello World!' })
class App { }

const AppModule = angular.module('app', [])
  .directive( ...provide(App) );

bootstrap(AppModule);
```

after:
```typescript
import { provide, Component } from 'ng-metadata/core';
import { bootstrap } from 'ng-metadata/platform';

@Component({ selector: 'app', template: 'Hello World!' })
class App { }

const AppModule = angular.module('app', [])
  .directive( ...provide(App) )
  .name;

bootstrap(AppModule);
```



<a name="1.5.1"></a>
## [1.5.1](https://github.com/ngParty/ng-metadata/compare/1.5.0...v1.5.1) (2016-04-16)


### Bug Fixes

* **common/directives:** fix ngForm implementation to match latest angular typings ([83d6e46](https://github.com/ngParty/ng-metadata/commit/83d6e46))
* **playground:** fix compilation errors and added missing types in ng-metadata.legacy.d.ts (#57) ([30d4e02](https://github.com/ngParty/ng-metadata/commit/30d4e02)), closes [(#57](https://github.com/(/issues/57)
* **playground:** fix ngForm implementation to match latest angular typings ([862f4bf](https://github.com/ngParty/ng-metadata/commit/862f4bf))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/ngParty/ng-metadata/compare/1.4.0...v1.5.0) (2016-04-11)


### Features

* **core/directives:** allow to create interpolation bindings via Input('@') and set Attr as deprecated ([52e2d1f](https://github.com/ngParty/ng-metadata/commit/52e2d1f))
* **playground:** use @Input for interpolation bindings ([895cd3a](https://github.com/ngParty/ng-metadata/commit/895cd3a))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/ngParty/ng-metadata/compare/1.3.0...v1.4.0) (2016-04-10)


### Features

* **common:** provide angular 1 directives as abstract classes so we can use them for DI ([42b466a](https://github.com/ngParty/ng-metadata/commit/42b466a))
* **core:** support Injection by Type via reflect-metadata design:paramtypes ([000553d](https://github.com/ngParty/ng-metadata/commit/000553d))
* **core/directives:** allow default values for directive/component public API ([076afe6](https://github.com/ngParty/ng-metadata/commit/076afe6))
* **facade/collections:** add fill ponyfill to ListWrapper ([6a590b1](https://github.com/ngParty/ng-metadata/commit/6a590b1))
* **facade/exceptions:** create helper for consistent error messages ([5a8ef71](https://github.com/ngParty/ng-metadata/commit/5a8ef71))
* **playground:** use new injection by type via reflect-metadata ([088ca11](https://github.com/ngParty/ng-metadata/commit/088ca11))


### BREAKING CHANGES

**core:**

- from now on ngMetadata leverages reflect-metadata polyfill, so you need to include it to your app
- also you need to add `"emitDecoratorMetadata": true` to your tsconfig.json



<a name="1.3.0"></a>
# [1.3.0](https://github.com/ngParty/ng-metadata/compare/1.2.0...v1.3.0) (2016-04-03)


### Features

* **core/change_detection:** implement ngOnChanges life cycle hook ([7a19876](https://github.com/ngParty/ng-metadata/commit/7a19876)), closes [#48](https://github.com/ngParty/ng-metadata/issues/48)
* **playground:** add OnChanges examples ([bfdfe0c](https://github.com/ngParty/ng-metadata/commit/bfdfe0c))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/ngParty/ng-metadata/compare/1.1.5...v1.2.0) (2016-04-02)


### Features

* **core/directives:** support one way binding for components by using @Input('<') ([5f1dd82](https://github.com/ngParty/ng-metadata/commit/5f1dd82)), closes [#54](https://github.com/ngParty/ng-metadata/issues/54)
* **playground:** add more examples with new features, like one way binding etc ([f07360c](https://github.com/ngParty/ng-metadata/commit/f07360c))



<a name="1.1.5"></a>
## [1.1.5](https://github.com/ngParty/ng-metadata/compare/1.1.4...v1.1.5) (2016-03-12)


### Bug Fixes

* **globals.d.ts:** move BrowserNodeGlobals to facade/lang so we don't need to force consumer to use ([bef75dc](https://github.com/ngParty/ng-metadata/commit/bef75dc)), closes [#40](https://github.com/ngParty/ng-metadata/issues/40)


### BREAKING CHANGES

* globals.d.ts:
- before you could use require because we shipped node ambient typings, from know on you have to install
your own node typings via `typings install node -SA`



<a name="1.1.4"></a>
## [1.1.4](https://github.com/ngParty/ng-metadata/compare/1.1.3...v1.1.4) (2016-03-06)


### Bug Fixes

* **core/directives/directive_provider:** create manually directive bindings via ng1 bindToController machinery for attrib ([73b539e](https://github.com/ngParty/ng-metadata/commit/73b539e)), closes [#51](https://github.com/ngParty/ng-metadata/issues/51)



<a name="1.1.3"></a>
## [1.1.3](https://github.com/ngParty/ng-metadata/compare/1.1.2...v1.1.3) (2016-03-02)


### Bug Fixes

* **core/directive_provider:** fix same directive type injection with different accessors ([7776400](https://github.com/ngParty/ng-metadata/commit/7776400)), closes [#52](https://github.com/ngParty/ng-metadata/issues/52)

### Features

* **playground:** add example for injecting same type of local directives with separate accessors ([01a91d7](https://github.com/ngParty/ng-metadata/commit/01a91d7))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/ngParty/ng-metadata/compare/1.1.2...v1.1.2) (2016-03-02)

### Bug Fixes

* **core/directive_provider:** fix initial @Input/@Attr binding assign for @Directive ([193834](https://github.com/ngParty/ng-metadata/commit/193834))


<a name="1.1.1"></a>
## [1.1.1](https://github.com/ngParty/ng-metadata/compare/1.1.0...v1.1.1) (2016-02-29)


### Bug Fixes

* **core/directive_provider:** fix evaluation expression for @Output called on @Directive ([5e35bde](https://github.com/ngParty/ng-metadata/commit/5e35bde))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/ngParty/ng-metadata/compare/1.0.0...v1.1.0) (2016-02-24)


### Features

* **core/directives/provider:** assign required controllers in preLink instead of controller ([9e662f7](https://github.com/ngParty/ng-metadata/commit/9e662f7)), closes [#50](https://github.com/ngParty/ng-metadata/issues/50)
* **playground:** add more complex examples to test proper local DI within directives ([dfe6a70](https://github.com/ngParty/ng-metadata/commit/dfe6a70))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/ngParty/ng-metadata/compare/1.0.0-rc.2...v1.0.0) (2016-02-14)


### Features

* **core/directives/provider:** instantiate custom controller via angular 1 machinery and allow local DI via loc ([268266d](https://github.com/ngParty/ng-metadata/commit/268266d)), closes [#43](https://github.com/ngParty/ng-metadata/issues/43)


### BREAKING CHANGES

* core/directives/provider: Simplified directive injection by removing the need to use 3 decorators

Previously if you wanted to achieve `require:['myCmp','ngModel']` you had to use 3 decorators:

```typescript
@Component({selector:'my-cmp',template:`Hey there`})
class MyCmp{
  constructor(@Inject('ngModel') @Host() @Self() private ngModel){}
}
```

from now on you have to use 3 decorators only if you wanna make it optional,
otherwise it will throw error:

```typescript
// OK
@Component({selector:'my-cmp',template:`Hey there`})
class MyCmp{
  constructor(@Inject('ngModel') @Self() private ngModel){}
}
```

for optional `require:['myCmp','?ngModel']`:

```typescript
// OK
@Component({selector:'my-cmp',template:`Hey there`})
class MyCmp{
  constructor(@Inject('ngModel') @Self() @Optional() private ngModel){}
}
```



<a name="1.0.0-rc.2"></a>
# [1.0.0-rc.2](https://github.com/ngParty/ng-metadata/compare/1.0.0-rc.1...v1.0.0-rc.2) (2016-02-07)


### Bug Fixes

* **core/linker/DirectiveResolver:** correctly resolve directive names when used Type withing @Inject ([938d54b](https://github.com/ngParty/ng-metadata/commit/938d54b))

### Features

* **core/di/forward_ref:** implement forward_ref for dependency injection ([69cf90c](https://github.com/ngParty/ng-metadata/commit/69cf90c))
* **core/di/provider:** throw error if more than one class decorator is used on non @Component+@StateCon ([9980df6](https://github.com/ngParty/ng-metadata/commit/9980df6))
* **core/directives/@Query:** add support to @ViewChild/@ViewChildren and @ContentChild/@ContentChildren decor ([789b91c](https://github.com/ngParty/ng-metadata/commit/789b91c)), closes [#39](https://github.com/ngParty/ng-metadata/issues/39) [#42](https://github.com/ngParty/ng-metadata/issues/42)
* **core/directives/@Query:** call AfterContentChecked/AfterViewChecked hooks automatically from children ([e01679c](https://github.com/ngParty/ng-metadata/commit/e01679c)), closes [#44](https://github.com/ngParty/ng-metadata/issues/44)
* **core/directives/provider:** allow to define custom compile or link function as static methods on class ([2bfc1c8](https://github.com/ngParty/ng-metadata/commit/2bfc1c8))
* **directives/linker:** add new lifecycle hooks and implementation checker ([ba70779](https://github.com/ngParty/ng-metadata/commit/ba70779))
* **playground:** add @Query decorators example ([4444320](https://github.com/ngParty/ng-metadata/commit/4444320))
* **util/decorators:** add decorators caching ([5c8e0e5](https://github.com/ngParty/ng-metadata/commit/5c8e0e5))



<a name="1.0.0-rc.1"></a>
# [1.0.0-rc.1](https://github.com/ngParty/ng-metadata/compare/1.0.0-rc.0...1.0.0-rc.1) (2016-01-19)


### Bug Fixes

* **core/directive/provider:** fix calling hooks from postlink with correct context for components ([779f120](https://github.com/ngParty/ng-metadata/commit/779f120))

### Features

* **facade/primitives/StringWrapper:** add utils for casing transforms ([fc08560](https://github.com/ngParty/ng-metadata/commit/fc08560))
* **manual_typings:** provide angular definitions override for our custom provide method ([a12891f](https://github.com/ngParty/ng-metadata/commit/a12891f))
* **playground:** update todo app to match latest release ([51cbd07](https://github.com/ngParty/ng-metadata/commit/51cbd07))
* **testing/utils:** create public helper methods for testing ([e3559d1](https://github.com/ngParty/ng-metadata/commit/e3559d1))



<a name="1.0.0-rc.0"></a>
# [1.0.0-rc.0](https://github.com/ngParty/ng-metadata/compare/1.0.0-beta.5...1.0.0-rc.0) (2016-01-18)


### Bug Fixes

* **core/directives:** wrap hostListener execution within $applyAsync to properly notify app state abou ([0f4f05c](https://github.com/ngParty/ng-metadata/commit/0f4f05c))
* **directives:** check if lifecycle hook exists and invoke it only when truthy ([4f0f1db](https://github.com/ngParty/ng-metadata/commit/4f0f1db))
* **directives/directive_provider:** add missing transclude to @Component DDO ([4934dd8](https://github.com/ngParty/ng-metadata/commit/4934dd8))
* **directives/directive_provider:** call directive hook methods only if ther are implemented ([127df3e](https://github.com/ngParty/ng-metadata/commit/127df3e))
* **directives/directive_provider:** correctly assign controller do DDO ([d839757](https://github.com/ngParty/ng-metadata/commit/d839757))
* **directives/directive_provider:** make dispose arrays empty arrays by default in _setupDestroyHandler ([aa9a16d](https://github.com/ngParty/ng-metadata/commit/aa9a16d))
* **ng-metadata:** fix import paths ([af0a3a3](https://github.com/ngParty/ng-metadata/commit/af0a3a3))
* **playground:** typing errors ([d689b64](https://github.com/ngParty/ng-metadata/commit/d689b64))
* **reflector,util/decorators:** fix property decorator registration ([60e042f](https://github.com/ngParty/ng-metadata/commit/60e042f))
* **tsc:** fix typescript errors ([b9e51b1](https://github.com/ngParty/ng-metadata/commit/b9e51b1))

### Features

* **common:** create common shell for abstract ng1 classes ([1d15690](https://github.com/ngParty/ng-metadata/commit/1d15690))
* **core:** create shell for core indexes ([cd76a5f](https://github.com/ngParty/ng-metadata/commit/cd76a5f))
* **core:** expose life cycle interface to public ([e972d1e](https://github.com/ngParty/ng-metadata/commit/e972d1e))
* **core/di/key:** create globalKey registry for storing unique service names ([2e450be](https://github.com/ngParty/ng-metadata/commit/2e450be))
* **core/di/metadata:** add id prop to InjectableMetadata to be able to store unique names for ng1 DI ([9aa5bbf](https://github.com/ngParty/ng-metadata/commit/9aa5bbf))
* **core/di/provider:** expose #getInjectableName as helper for getting JIT service names ([0baa6d8](https://github.com/ngParty/ng-metadata/commit/0baa6d8))
* **core/directive/provider:** support AfterViewInit and AfterContentInit lifecycle hooks ([24aa371](https://github.com/ngParty/ng-metadata/commit/24aa371))
* **core/directives/provider:** assign required directive injections in OnInit if implemented otherwise by defau ([efc0807](https://github.com/ngParty/ng-metadata/commit/efc0807))
* **core/provider:** allow to register pure services without injections and check if @inject is used  ([8e04c2e](https://github.com/ngParty/ng-metadata/commit/8e04c2e))
* **core/util/decorators:** add unique ID if decorating with @Injectable to get unique name for classes when ([bc1ead7](https://github.com/ngParty/ng-metadata/commit/bc1ead7))
* **di/decorators:** create all Di param and class decorators ([010785e](https://github.com/ngParty/ng-metadata/commit/010785e)), closes [#34](https://github.com/ngParty/ng-metadata/issues/34)
* **di/fref,key:** add key storage for Inject resolving and forward_ref ([7f95954](https://github.com/ngParty/ng-metadata/commit/7f95954))
* **di/opaque_token:** add OpaqueToken for creating unique tokens ([b54c462](https://github.com/ngParty/ng-metadata/commit/b54c462))
* **di/Optional,Host,Parent:** create new param decorators for injecting directives/components ([d257726](https://github.com/ngParty/ng-metadata/commit/d257726))
* **di/provider:** create provide function for instances registration to ng container ([b4699fa](https://github.com/ngParty/ng-metadata/commit/b4699fa))
* **di/provider:** create provide public API ([3cfa92d](https://github.com/ngParty/ng-metadata/commit/3cfa92d))
* **directives:** create metadata and decorators ([c51b8aa](https://github.com/ngParty/ng-metadata/commit/c51b8aa))
* **directives/directive_provider:** create directive provider ([272d4b6](https://github.com/ngParty/ng-metadata/commit/272d4b6))
* **facade/collections:** add getValueFromPath and baseGet to StringMapWrapper ([93d1d25](https://github.com/ngParty/ng-metadata/commit/93d1d25))
* **facade/collections:** add getValueFromPath and baseGet to StringMapWrapper ([454342c](https://github.com/ngParty/ng-metadata/commit/454342c))
* **facade/collections:** add getValueFromPath and baseGet to StringMapWrapper ([2f2eec0](https://github.com/ngParty/ng-metadata/commit/2f2eec0))
* **facade/collections:** add Object.values ponyfill to StringMapWrapper ([6090684](https://github.com/ngParty/ng-metadata/commit/6090684))
* **facade/collections:** add own Object.assign ponyfill ([2b07b23](https://github.com/ngParty/ng-metadata/commit/2b07b23))
* **facade/collections:** create collections wrappers for common List and StringMap functionality ([b2ade0d](https://github.com/ngParty/ng-metadata/commit/b2ade0d))
* **facade/collections/listWrapper:** add helper methods for Array handling ([37a464b](https://github.com/ngParty/ng-metadata/commit/37a464b))
* **facade/lang:** add baseToString,toObject and toPath helpers ([34ae6c6](https://github.com/ngParty/ng-metadata/commit/34ae6c6))
* **facade/lang:** add ES6 Array ponyfills ([fd953de](https://github.com/ngParty/ng-metadata/commit/fd953de))
* **facade/primitives:** StringWrapper with es6 ponyfills ([3093379](https://github.com/ngParty/ng-metadata/commit/3093379))
* **linker/directive_resolver:** create #getRequiredDirectivesMap ([20796ed](https://github.com/ngParty/ng-metadata/commit/20796ed))
* **linker/directive_resolver:** create directive resolver ([a4cb0c0](https://github.com/ngParty/ng-metadata/commit/a4cb0c0))
* **linker/lifecycle:** create lifecycle interfaces and reflector helpers ([345adac](https://github.com/ngParty/ng-metadata/commit/345adac))
* **linker/pipe_resolver:** create pipe resolver ([94d1412](https://github.com/ngParty/ng-metadata/commit/94d1412))
* **manual_typings:** add angular 1 override module typings to work with ...provide() ([5a58ce3](https://github.com/ngParty/ng-metadata/commit/5a58ce3))
* **manual_typings:** instead of override global use node type defs ([4835e59](https://github.com/ngParty/ng-metadata/commit/4835e59))
* **npm:** tweak .npmignore and build step to prepublish ([bdd7ae1](https://github.com/ngParty/ng-metadata/commit/bdd7ae1))
* **pipes/pipe_provider:** create pipe provider for creating angular.filter with correct name for ng contai ([bd4f603](https://github.com/ngParty/ng-metadata/commit/bd4f603))
* **platform:** create platform with bootstrap fn helper ([402c5c8](https://github.com/ngParty/ng-metadata/commit/402c5c8))
* **playground:** refactor demo to new ngMetadata api ([d587dba](https://github.com/ngParty/ng-metadata/commit/d587dba))
* **reflection:** create reflector for resolving all metadata on Type ([637e54c](https://github.com/ngParty/ng-metadata/commit/637e54c))
* **reflection/reflector:** always return array ([4533cf0](https://github.com/ngParty/ng-metadata/commit/4533cf0))
* **scripts:** create script for adding ambient type def reference to core.d.ts ([b21be30](https://github.com/ngParty/ng-metadata/commit/b21be30))
* **testing:** create testing api helpers root ([e538f74](https://github.com/ngParty/ng-metadata/commit/e538f74))
* **testing/utils:** add $injector mock ([dcb39b3](https://github.com/ngParty/ng-metadata/commit/dcb39b3))
* **testing/utils:** create mocks for angular like internals ([bb85dc7](https://github.com/ngParty/ng-metadata/commit/bb85dc7))
* **util/decorators:** create factory functions for all decorators ([946d6e8](https://github.com/ngParty/ng-metadata/commit/946d6e8)), closes [#33](https://github.com/ngParty/ng-metadata/issues/33)



<a name="1.0.0-beta.5"></a>
# [1.0.0-beta.5](https://github.com/ngParty/ng-metadata/compare/1.0.0-beta.4...1.0.0-beta.5) (2015-12-21)


### Features

* **playground/app:** add todo app ([b90ae5f](https://github.com/ngParty/ng-metadata/commit/b90ae5f)), closes [#20](https://github.com/ngParty/ng-metadata/issues/20)



<a name="1.0.0-beta.4"></a>
# [1.0.0-beta.4](https://github.com/ngParty/ng-metadata/compare/1.0.0-beta.3...1.0.0-beta.4) (2015-12-08)


### Bug Fixes

* **facade:** fix issues with global resolution ([a68fc77](https://github.com/ngParty/ng-metadata/commit/a68fc77))
* **facade:** fix issues with global resolution by providing custom assign ([080ce7e](https://github.com/ngParty/ng-metadata/commit/080ce7e))



