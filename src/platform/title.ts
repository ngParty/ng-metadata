import { Injectable, Inject } from '../core/di/decorators';
/**
 * A service that can be used to get and set the title of a current HTML document.
 *
 * Since an Angular 2 application can't be bootstrapped on the entire HTML document (`<html>` tag)
 * it is not possible to bind to the `text` property of the `HTMLTitleElement` elements
 * (representing the `<title>` tag). Instead, this service can be used to set and get the current
 * title value.
 *
 * **NOTE:**
 * you need to import this service and register within root component ( root module in Angular 1 terms )
 *
 * ```typescript
 * // index.ts
 *
 * import * as angular from 'angular';
 * import { provide } from 'ng-metadata/core';
 * import { Title } from 'ng-metadata/platform';
 *
 * import { AppComponent} from './app';
 *
 * export AppModule = angular.module('myApp',[])
 *  // we need to register the service manually
    .service( ...provide( Title ) )
    .directive( ...provide( AppComponent ))
 * ```
 */
@Injectable( 'Title' )
export class Title {

  constructor( @Inject( '$document' ) private $document: ng.IDocumentService ) {}

  /**
   * Get the title of the current HTML document.
   * @returns {string}
   */
  getTitle(): string { return this.$document[ 0 ].title }

  /**
   * Set the title of the current HTML document.
   * @param newTitle
   */
  setTitle( newTitle: string ) { this.$document[ 0 ].title = newTitle || ''; }
}
