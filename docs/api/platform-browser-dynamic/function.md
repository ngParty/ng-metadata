# Function

- [bootstrap](#bootstrap)


## bootstrap

> **module:** `ng-metadata/platform`

Used to bootstrap your application manually after DOMContentLoaded is fired. Do **not** use the `ng-app` directive.

*example:*

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

###### Parameters

| Parameter     | Type                            | Description                               |
| ------------- | ------------------------------- |------------------------------------------ |
| **ngModule**  | `string`                        | angular module name                       |
| **{ element?, **  | `Element` or `string`(selector) | you can provide on which element or selector you want to boot your app. Default element is `document` |
| **, strictDi? }** | `boolean`                   | enable strictdi check, to force explicit $inject annotation for all object registered in angular module (more info in [angular docs](https://docs.angularjs.org/error/$injector/strictdi)). Default value is `true` |

returns `undefined`

###### Behind the Scenes

`angular.bootstrap` is called on the page element that matches the element parameter or by default on `document`. 
This action is invoked inside `angular.element( document ).ready` function. 
