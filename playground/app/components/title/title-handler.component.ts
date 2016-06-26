// Import the native Angular services.
import { Component } from 'ng-metadata/core';
import { Title }     from 'ng-metadata/platform-browser-dynamic';

@Component({
  selector: 'my-title-handler',
  template: `
  <p>Document title is: {{ $ctrl.title }}</p>
  <p>
    Select a title to set on the current HTML document:
  </p>
  <ul>
    <li><a ng-click="$ctrl.setTitle( 'Good morning!' )">Good morning</a>.</li>
    <li><a ng-click="$ctrl.setTitle( 'Good afternoon!' )">Good afternoon</a>.</li>
    <li><a ng-click="$ctrl.setTitle( 'Good evening!' )">Good evening</a>.</li>
  </ul>
  `
})
export class TitleHandlerComponent {
  constructor(private titleService: Title ) {}

  get title(): string { return this.titleService.getTitle() }

  setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }
}
