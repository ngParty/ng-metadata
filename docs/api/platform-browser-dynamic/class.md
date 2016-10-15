# Class

**Global Injectables**

These services can be injected globally ( standard Angular 1 injectables )

- [Title](#title)

---

## Title

A service that can be used to get and set the title of a current HTML document.

Since an Angular 2 application can't be bootstrapped on the entire HTML document (`<html>` tag), 
it is not possible to bind to the text property of the HTMLTitleElement elements (representing the `<title>` tag). 
Instead, this service can be used to set and get the current title value.

> this is not true in terms of Angular 1, but adhering to Angular 2 principles we build cleaner and migration ready codebase

**NOTE:**
you need to import this service and register within root component ( root module in Angular 1 terms )

| members           | Type       | Description                                  |
| ----------------- | ---------- |--------------------------------------------- |
| **setTitle(newTitle:string):void**  | `Function` | Set the title of the current HTML document. |
| **getTitle():string**  | `Function` | Get the title of the current HTML document. |
 
**example:**

> [Live example can be found in Playground](https://github.com/ngParty/ng-metadata/tree/master/playground/app/components/title)

```typescript
// app.component.ts
import { Component } from 'ng-metadata/core';
import { Title } from 'ng-metadata/platform-browser-dynamic';

@Component({
  selector: 'my-app',
  template: `
  <p>Document title is: {{ $ctrl.title }}</p>
  <p>
    Select a title to set on the current HTML document:
  </p>
  <ul>
    <li><a ng-click="$ctrl.setTitle( 'Good morning!' )">Good morning</a>.</li>
    <li><a ng-click="$ctrl.setTitle( 'Good afternoon!' )">Good afternoon</a>.</li>
    <li><a ng-click="$ctrl.setTitle( 'Good evening!' )">Good evening</a>.</li>
  </ul>
  `
})
export class AppComponent {
  constructor(private titleService: Title ) {}

  get title(): string { return this.titleService.getTitle() }

  setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }
}

// app.module.ts
import { NgModule } from 'ng-metadata/core';
import { Title } from 'ng-metadata/platform-browser-dynamic';
import { AppComponent } from './app.component';

@NgModule({
  providers: [ Title ],
  declarations: [ AppComponent ]
})
export class AppModule {}

// main.ts
import { platformBrowserDynamic } from 'ng-metadata/platform-browser-dynamic';
import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule( AppModule );
```
