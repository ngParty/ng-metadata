import { Provider } from './provider';

export type ProviderLiteral = {
  provide: any,
  useClass?: Type,
  useValue?: any,
  useFactory?: Function,
  useExisting?: any,
  deps?: Object[],
  multi?: boolean
};

export function isProviderLiteral( obj: any ): obj is ProviderLiteral {
  return obj && typeof obj == 'object' && obj.provide;
}

export function createProvider( obj: ProviderLiteral ): Provider {
  return new Provider( obj.provide, obj );
}
