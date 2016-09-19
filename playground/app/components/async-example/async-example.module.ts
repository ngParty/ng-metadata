import { NgModule } from 'ng-metadata/core';
import { AsyncExampleComponent, AsyncTaskComponent } from './async-example.component';

@NgModule({
  imports: [],
  exports: [AsyncExampleComponent],
  declarations: [AsyncExampleComponent, AsyncTaskComponent]
})
export class AsyncExampleModule{}
