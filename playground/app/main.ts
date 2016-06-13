//main entry point
import { bootstrap } from 'ng-metadata/platform';
import { Title } from 'ng-metadata/platform';
import { AsyncPipe } from 'ng-metadata/common';
import { enableProdMode } from 'ng-metadata/core';

import { AppComponent } from './app.component';
import { AppModule, configureProviders } from './index';

// enableProdMode();

bootstrap( AppComponent, [ Title, AsyncPipe, AppModule, configureProviders ] );
