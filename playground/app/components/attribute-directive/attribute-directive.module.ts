import { NgModule } from 'ng-metadata/core';

import { AttributeDirectiveExampleComponent, PreventKeydownDirective } from './attribute-directive-example.component';
import { HighlightDirective } from './highlight.directive';

@NgModule({
  imports: [],
  // exports, bootstrap, entryComponents have no real functionality yet
  exports: [AttributeDirectiveExampleComponent],
  declarations: [
    AttributeDirectiveExampleComponent,
    HighlightDirective,
    PreventKeydownDirective
  ]
})
export class AttributeDirectiveModule{}
