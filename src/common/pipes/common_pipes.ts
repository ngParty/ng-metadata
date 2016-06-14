/**
 * @module
 * @description
 * This module provides a set of common Pipes.
 */
import { AsyncPipe } from './async_pipe';

/**
 * A collection of Angular core pipes that are likely to be used in each and every
 * application.
 *
 * This collection can be used to quickly enumerate all the built-in pipes in the `pipes`
 * property of the `@Component` decorator.
 *
 * @experimental Contains i18n pipes which are experimental
 */
export const COMMON_PIPES = [
  AsyncPipe
];
