import { NgModule } from 'ng-metadata/core';
import { AsyncExampleComponent, AsyncTaskComponent } from './async-example.component';
import { AsyncDestroyChildComponent, AsyncDestroyComponent, AsyncDestroyContainerComponent } from './async-destroy.component';

@NgModule({
  imports: [],
  // exports, bootstrap, entryComponents have no real functionality yet
  exports: [AsyncExampleComponent],
  declarations: [AsyncExampleComponent, AsyncTaskComponent, AsyncDestroyComponent, AsyncDestroyChildComponent, AsyncDestroyContainerComponent]
})
export class AsyncExampleModule{}
