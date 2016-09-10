import { createBootstrapFn, createBootstrapModuleFn } from './browser_utils'

export const bootstrap = createBootstrapFn()

export * from './title';

export const platformBrowserDynamic = () => {
  return {
    bootstrapModule: createBootstrapModuleFn(),
  }
}

