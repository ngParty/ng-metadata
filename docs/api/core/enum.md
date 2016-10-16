# Enum

- [ChangeDetectionStrategy](#changedetectionstrategy)


---


## ChangeDetectionStrategy

Describes within the change detector which strategy will be used the next time change detection is triggered.

It works only with `@Component`s which have bound properties via one way data binding `@Input('<')`.

> Using OnPush is much more convenient than manually declaring ngOnChanges and copying binding values there, so we get immutable data
> Under the hood it just calls angular.copy and assigns that new binding reference value to component property

###### members

| members       | Type                            | Description                                  |
| ------------- | ------------------------------- |--------------------------------------------- |
| **OnPush**    | `enum` | OnPush means that the change detector's mode will be set to CheckOnce during hydration |
| **Default**   | `enum` | This strategy has every component by default for one way data bound properties. Default means that the change detector's mode will be set to CheckAlways during hydration. |

*example:*

```typescript
import { Component, Input, OnChanges, ChangeDetectionStrategy } from 'ng-metadata/core';
import { User } from './user.model';

@Component( {
  selector: 'child',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <input type="text" ng-model="$ctrl.user.name">
    </div>
  `
} )
export class ChildComponent implements OnChanges {

  // without OnPush if we change some property on this object in the parent, it will mutate also within child,
  // because that's how javascript works (Objects are passed reference baby!)
  // => this is not true if the bounded property is a primitive ( again this is how JS works)
  @Input('<') user: User;

  ngOnChanges( changes ) {
    if(changes.user){
      // this will execute only when user reference has changed on parent
      console.log(changes.user);
    }
  }

}
```
