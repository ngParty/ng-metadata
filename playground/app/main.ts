//main entry point
import { platformBrowserDynamic } from 'ng-metadata/platform-browser-dynamic';

import { enableProdMode } from 'ng-metadata/core';

import { AppModule } from './app.module';

// enableProdMode();

const platform = platformBrowserDynamic();
platform.bootstrapModule( AppModule );
