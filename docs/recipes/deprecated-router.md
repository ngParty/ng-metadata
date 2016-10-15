# Deprecated Component Router

> **NOTE:** component router works only with Angular >= 1.5 !!!
> **NOTE 2:** this router has been deprecated since Angular 1.5.6 ( Thank you very much Angular team ... )

> [check complete working example](https://github.com/ngParty/Angular1-scaffold/tree/component-router)

install `npm install --save @angular/router@0.2.0`

Include it to your bundle via empty import

```typescript
// /vendor.ts

import 'angular';
// here we are loading ngComponentRouter
import '@angular/router/angular1/angular_1_router';

import 'ng-metadata/platform-browser-dynamic';
import 'ng-metadata/core';
import 'ng-metadata/common';
// typings and providers for ngComponentRouter
import 'ng-metadata/router-deprecated';
```

Use it within your app like following

```typescript
//app.component.ts
import { Component, OnInit, Inject } from 'ng-metadata/core';

@Component({
  selector: 'app',
  styles: [ require( './app.scss' ) ],
  template: `
    <h1>Hello from Pluto!!!</h1>
    <nav>
      <a ng-link="['CrisisCenter']">Crisis Center</a>
      <a ng-link="['Heroes']">Heroes</a>
    </nav>
    <ng-outlet></ng-outlet>
  `,
  legacy: {
    $routeConfig: [
      { path: '/crisis-center/...', name: 'CrisisCenter', component: 'crisisCenter', useAsDefault: true },
      { path: '/heroes/...', name: 'Heroes', component: 'heroes' }
    ]
  }
})
export class AppComponent implements OnInit {

  constructor( @Inject( '$log' ) private _$log: ng.ILogService ) {}

  ngOnInit() {
    this._$log.log( 'hello from pluto during OnInit' );
  }

}

// app.module.ts
import { NgModule, getInjectableName } from 'ng-metadata/core';
import { ROUTER_PRIMARY_COMPONENT } from 'ng-metadata/router-deprecated';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [ AppComponent ],
  providers: [
    'ngComponentRouter',
    { provide: ROUTER_PRIMARY_COMPONENT, useValue: getInjectableName( AppComponent ) }
  ]
})
export class AppModule {}

// main.ts
import { platformBrowserDynamic } from 'ng-metadata/platform-browser-dynamic';
import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
```
