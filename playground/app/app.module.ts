import { NgModule } from 'ng-metadata/core';
import { AsyncPipe } from 'ng-metadata/common';
import { Title } from 'ng-metadata/platform-browser-dynamic';

import { TodoAppModule } from './todo/todo.module'
import { AttributeDirectiveModule } from './components/attribute-directive/attribute-directive.module';
import { AsyncExampleModule } from './components/async-example/async-example.module';

// @TODO move this to module
import { Ng1LegacyModule, configureProviders } from './index';

import { AppComponent } from './app.component';

@NgModule({
  imports: [Ng1LegacyModule, TodoAppModule, AttributeDirectiveModule, AsyncExampleModule],
  providers: [Title, configureProviders],
  declarations: [AsyncPipe, AppComponent],
  // exports, bootstrap, entryComponent have no real functionality yet
  bootstrap: [AppComponent]
})
export class AppModule{}
