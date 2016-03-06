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



