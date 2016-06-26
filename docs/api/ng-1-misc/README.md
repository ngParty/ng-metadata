# Angular 1 specific API's

## Static methods on Component/Directive classes (angular 1 specific API)

- [compile](#ddocompile)
- [link](#ddolink)

---

### compile

Angular 1 directive definition object supports `compile` function for manipulating DOM
and other low level stuff before the directive/component is linked to the scope and re-rendered to DOM.

We provide this functionality by creating `static compile(tElement,tAttrs)` on your Directive/Component your class.

**Note:**
> You cannot inject anything from `$injector`
> Compile can return a link object or directly postLink function, but beware to do this!
> If you return link object/postLink fn, all logic that you've created by for example `@HostListener` decorators 
and life cycle hooks will be discarted and you have to do it on your own, 
so for those reason it is really not advised to return a function from compile method.  

_Example:_

```typescript
import {Directive} from 'ng-metadata/core';

@Directive({selector:'[dom-modify]'})
class DomModfify{
 static compile(tElement: ng.IAugmentedJQuery, tAttrs: ng.IAtrributes){
   // your logic
 } 
}
```

###### [Parameters](https://docs.angularjs.org/api/ng/service/$compile#-compile-)


### link

Angular 1 directive definition object supports `link` property on DDO for handling logic within your directives.

We provide this functionality by creating `static link(scope,element,attrs,controllers,translcude)` on your Directive/Component your class.

**Note:**
> You cannot inject anything from `$injector`
> As mentioned above in `compile` if, you define link this way, it will override all previosly defined behavior,
so yeah try to avoid this, you can do all postLink stuf within your life cycle hook `ngAfterViewInit` or `ngAfterContentInit`

_Example:_

```typescript
import {Directive} from 'ng-metadata/core';

@Directive({selector:'[custom-link]'})
class CustomLink{
 static link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAtrributes, controller: any, transclude:ng.ITransclusionFn){
   // your logic
 } 
}
```

###### [Parameters](https://docs.angularjs.org/api/ng/service/$compile#-link-)
