import { Component } from 'ng-metadata/core';

import { HighlightDirective } from './highlight.directive';

@Component({
  selector: 'my-attribute-directive-example',
  template: `
    <h1>My First Attribute Directive</h1>
    <h4>Pick a highlight color</h4>
    <div>
      <input type="radio" name="colors" ng-click="$ctrl.color='lightgreen'">Green
      <input type="radio" name="colors" ng-click="$ctrl.color='yellow'">Yellow
      <input type="radio" name="colors" ng-click="$ctrl.color='cyan'">Cyan
    </div>

    <p my-highlight [color]="$ctrl.color" (on-color-click)="$ctrl.colorClicked($event)">Highlight me!</p>

    <p my-highlight [color]="$ctrl.color" [default-color]="'violet'">Highlight me too!</p>
  `,
  directives: [HighlightDirective]
})
export class AttributeDirectiveExampleComponent {
  color: string;

  colorClicked(sentence: string){
    console.log(`color clicked! ${sentence}`);
  }
}
