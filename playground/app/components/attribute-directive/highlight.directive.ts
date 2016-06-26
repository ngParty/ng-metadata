import { Directive, HostListener, Input, Inject, Output, EventEmitter } from 'ng-metadata/core';

@Directive({
  selector: '[myHighlight]'
})
export class HighlightDirective {
  private _defaultColor = 'red';
  private el: HTMLElement;

  constructor(
    @Inject('$element') $element: ng.IAugmentedJQuery
  ) {
    this.el = $element[0];
  }

  @Input() set defaultColor(colorName: string){
    this._defaultColor = colorName || this._defaultColor;
  }

  @Input('color') highlightColor: string;

  @Output() onColorClick = new EventEmitter<string>();

  @HostListener('mouseenter')
  onMouseEnter() {
    this.highlight(this.highlightColor || this._defaultColor);
  }
  @HostListener('mouseleave')
  onMouseLeave() {
    this.highlight(null);
  }
  @HostListener('click')
  onClick() {
    this.onColorClick.emit('yes it was ME!');
  }

  private highlight(color: string) {
    this.el.style.backgroundColor = color;
  }
}
/*
@Input() myHighlight: string;
*/


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
