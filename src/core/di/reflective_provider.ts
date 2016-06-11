import { Provider, provide } from './provider';

export function resolveReflectiveProvider( provider: Provider ): {method: string, name: string, value: any} {

  const {token} = provider;

  if (provider.useValue) {
    const [name,value] = provide( token, { useValue: provider.useValue } );
    const method = 'value';
    return { method, name, value };
  }
  if (provider.useFactory) {
    const [name,value] = provide( token, { useFactory: provider.useFactory, deps: provider.dependencies } );
    const method = 'factory';
    return { method, name, value };
  }
  if (provider.useClass) {
    const [name,value] = provide( token, { useClass: provider.useClass } );
    const method = 'service';
    return { method, name, value };
  }
  if (provider.useExisting) {
    const [name,value] = provide( provider.useExisting );
    const method = 'factory';
    // target = (v) => v;
    // annotate(target, 'factory', {name});
    // annotate(target, 'inject', [toInjectorName(provider.useExisting)]);
  }

}
