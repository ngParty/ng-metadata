# Function

- [bootstrap](#bootstrap)

---

## bootstrap

Bootstrapping for Angular applications.

You instantiate an Angular application by explicitly specifying a component to use as the root component for your application via the bootstrap() method.

> bootstrap your application manually after DOMContentLoaded is fired. Do **not** use the `ng-app` directive.

It bootstraps the app on `document` element

*example:*

```html
<!--index.html-->

<!-- load Angular script tags here. -->
<body>
  <my-app>loading...</my-app>
</body>
```

```typescript
// app.component
import { Component } from 'ng-metadata/core';

@Component({
  selector: 'my-app',
  template: `Hello {{ $ctrl.name }}!`,
})
class AppComponent{
  name: string = 'World';
}

// main.ts
import { bootstrap } from 'ng-metadata/platform-browser-dynamic';
import { AppComponent } from './app.component';

bootstrap( AppComponent )
```

###### Parameters

| Parameter             | Type                            | Description                                |
| --------------------- | ------------------------------- | ------------------------------------------ |
| **appComponentType**  | `Type`                          | The root component which should act as the application. This is a reference to a Type which is annotated with @Component(...) |
| **customProviders?**  | `Array<Type OR Function OR string OR any[]>` |  An additional set of providers that can be added to the app injector to override default injection behavior. It also accepts 3rd party angular modules as string, or configPhase functions |

returns `undefined`

###### Behind the Scenes

`angular.bootstrap` is called on the page element that matches the element parameter or by default on `document`. 
This action is invoked inside `angular.element( document ).ready` function. 
