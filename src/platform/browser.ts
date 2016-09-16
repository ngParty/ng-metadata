import { createBootstrapFn } from './browser_utils'

export * from './title';

export const platformBrowserDynamic = () => {
  return {
    bootstrapModule: createBootstrapFn(),
  }
}

