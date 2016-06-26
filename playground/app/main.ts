//main entry point
import { bootstrap, Title } from 'ng-metadata/platform-browser-dynamic';
import { AsyncPipe } from 'ng-metadata/common';
import { enableProdMode } from 'ng-metadata/core';

import { AppComponent } from './app.component';
import { AppModule, configureProviders } from './index';

// enableProdMode();

bootstrap( AppComponent, [ Title, AsyncPipe, AppModule, configureProviders ] );
