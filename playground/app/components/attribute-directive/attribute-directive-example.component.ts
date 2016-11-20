import { Component, Directive, HostListener } from 'ng-metadata/core';

@Directive({ selector: '[my-prevent-keydown-directive]' })
export class PreventKeydownDirective {
    counter = 0;
    @HostListener('keydown', ['$event'])
    onKeyDown(e: KeyboardEvent) {
      console.warn('==keydown prevented haha!==',e.which);
      this.counter = this.counter + 1;
      // allow on even keydown
      if(this.counter % 2 !== 0){
        return false;
      }
    }
}

@Component({
  selector: 'my-attribute-directive-example',
  template: `
    <section>
      <h3>prevent keydown</h3>
      <input my-prevent-keydown-directive type="text" ng-model="$ctrl.someValue">
      <code>{{ $ctrl.someValue }}</code>
      <p>
        This input is decorated with [my-prevent-keydown-directive] directive, so you cannot type there.
        Although you can on every even keydown ;)
      </p>
    </section>
    <h1>My First Attribute Directive</h1>
    <h4>Pick a highlight color</h4>
    <div>
      <input type="radio" name="colors" ng-click="$ctrl.color='lightgreen'">Green
      <input type="radio" name="colors" ng-click="$ctrl.color='yellow'">Yellow
      <input type="radio" name="colors" ng-click="$ctrl.color='cyan'">Cyan
    </div>

    <p my-highlight [color]="$ctrl.color" (on-color-click)="$ctrl.colorClicked($event)">Highlight me!</p>

    <p my-highlight [color]="$ctrl.color" [default-color]="'violet'">Highlight me too!</p>
  `
})
export class AttributeDirectiveExampleComponent {
  color: string;

  colorClicked(sentence: string){
    console.log(`color clicked! ${sentence}`);
  }
}
