# Class

- [NgMetadataUpgradeAdapter](#NgMetadataUpgradeAdapter)

---

## NgMetadataUpgradeAdapter

Please see the [ngUpgrade recipe](/docs/recipes/ng-upgrade.md) for how to use the NgMetadataUpgradeAdapter.

###### Parameters

| Parameter           | Type                           | Description                                               |
| ------------------- | ------------------------------ | --------------------------------------------------------- |
| **UpgradeAdapter**  | Type                           | Official UpgradeAdapter constructor from @angular/upgrade |

returns upgradeAdapter `Object`

###### Behind the Scenes

It creates the `upgradeAdapter` singleton and returns an object with various helper methods for upgrading and downgrading Providers and Components for use in hybrid Angular 1 and Angular 2 applications.

###### Members
| members                   | Type       | Description                                                                                    |
| ------------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| **bootstrap**             | `Function` | Replaces the bootstrap from ng-metadata/core to bootstrap a hybrid application.                |
| **downgradeNg2Component** | `Function` | Used to register an ng2 component as a directive on an ng1 module.                             |
| **provideNg2Component**   | `Function` | Used to register an ng2 component by including it in the directives array of an ng1 Component. |
| **addProvider**           | `Function` | Adds an ng2 provider to the hybrid application.                                                |
| **downgradeNg2Provider**  | `Function` | Downgrades an ng2 Provider so that it can be registered as an ng1 factory.                     |
| **provideNg2Provider**    | `Function` | Used to register an ng2 Provider by including it in the providers array of an ng1 component.   |
| **upgradeNg1Provider**    | `Function` | Used to make an ng1 Provider available to ng2 Components and Providers.                        |
