# Function

- [platformBrowserDynamic](#platformBrowserDynamic)

---

## platformBrowserDynamic

We use the `platformBrowserDynamic` function to create a "platform" for our application. This platform object has a "bootstrapModule" method on it which we use to bootstrap our Angular applications.

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

// app.module.ts
import { NgModule } from 'ng-metadata/core';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [ AppComponent ]
})
export class AppModule {}

// main.ts
import { platformBrowserDynamic } from 'ng-metadata/platform-browser-dynamic';
import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule( AppModule );
```

###### platformBrowserDynamic().bootstrapModule Parameters

| Parameter             | Type                            | Description                                |
| --------------------- | ------------------------------- | ------------------------------------------ |
| **appComponentType**  | `Type`                          | The root NgModule which should act as the application. This is a reference to a Type which is annotated with @NgModule(...) |
| **customProviders?**  | `Array<Type OR Function OR string OR any[]>` |  An additional set of providers that can be added to the app injector to override default injection behavior. It also accepts 3rd party angular modules as string, or configPhase functions |

returns `undefined`

###### Behind the Scenes

`angular.bootstrap` is called on the page element that matches the element parameter or by default on `document`. 
This action is invoked inside `angular.element( document ).ready` function. 
