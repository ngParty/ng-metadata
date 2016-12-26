# Class ( Deprecated - use [upgrade/static](/docs/recipes/function.md))

- [NgMetadataUpgradeAdapter](#NgMetadataUpgradeAdapter)

---

## NgMetadataUpgradeAdapter

Please see the [ngUpgrade recipe](/docs/recipes/ng-upgrade.md) for how to use the NgMetadataUpgradeAdapter.

###### Parameters

| Parameter           | Type                           | Description                                               |
| ------------------- | ------------------------------ | --------------------------------------------------------- |
| **upgradeAdapter**  | Object                         | Instantiated UpgradeAdapter from official @angular/upgrade |

returns ng-metadata upgradeAdapter `Object`

###### Behind the Scenes

It wraps the `upgradeAdapter` singleton and returns an object with various helper methods for upgrading and downgrading Providers and Components for use in hybrid Angular 1 and Angular 2 applications.

###### Members
| members                   | Type       | Description                                                                                    |
| ------------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| **bootstrap**             | `Function` | Replaces the platformBrowserDynamic().bootstrapModule from ng-metadata/platform-browser-dynamic to bootstrap a hybrid application.                |
| **downgradeNg2Component** | `Function` | Used to register an ng2 component as a directive on an ng1 module.                             |
| **provideNg2Component**   | `Function` | Used to register an ng2 component by including it in the directives array of an ng1 Component. |
| **downgradeNg2Provider**  | `Function` | Downgrades an ng2 Provider so that it can be registered as an ng1 factory.                     |
| **provideNg2Provider**    | `Function` | Used to register an ng2 Provider by including it in the providers array of an ng1 component.   |
| **upgradeNg1Provider**    | `Function` | Used to make an ng1 Provider available to ng2 Components and Providers.                        |
