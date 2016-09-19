import { NgModule } from 'ng-metadata/core';

import { AttributeDirectiveExampleComponent } from './attribute-directive-example.component';
import { HighlightDirective } from './highlight.directive';

@NgModule({
  imports: [],
  exports: [AttributeDirectiveExampleComponent],
  declarations: [AttributeDirectiveExampleComponent, HighlightDirective]
})
export class AttributeDirectiveModule{}
