/**
 * `UgradeAdapterRef` controls a hybrid AngularJS v1 / Angular v2 application,
 * but we don't have a use for it right now so no point in creating an interface for it...
 */
export type UgradeAdapterRef = void;

export interface UpgradeAdapter {
  new (): UpgradeAdapterInstance;
}

export interface UpgradeAdapterInstance {
  /**
   * Allows Angular v2 Component to be used from AngularJS v1.
   */
  downgradeNg2Component(type: Type): Function;
  /**
   * Bootstrap a hybrid AngularJS v1 / Angular v2 application.
   */
  bootstrap(element: Element, modules?: any[], config?: angular.IAngularBootstrapConfig): UgradeAdapterRef;
  /**
   * Adds a provider to the top level environment of a hybrid AngularJS v1 / Angular v2 application.
   */
  addProvider(provider: Type | any[] | any): void;
  /**
   * Allows Angular v2 service to be accessible from AngularJS v1.
   */
  downgradeNg2Provider(token: any): Function;
  /**
   * Allows AngularJS v1 service to be accessible from Angular v2.
   */
  upgradeNg1Provider(name: string, options?: { asToken: any; }): void;
}
