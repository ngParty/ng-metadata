/* tslint:disable:forin */
import {
  Component, Input, OnChanges,
  SimpleChange, SimpleChanges, ViewChild
} from 'ng-metadata/core';


class Hero {
  constructor(public name: string) {}
}

@Component({
  selector: 'on-changes',
  template: `
  <div class="hero">
    <p>{{$ctrl.hero.name}} can {{$ctrl.power}}</p>

    <h4>-- Change Log --</h4>
    <div ng-repeat="chg in $ctrl.changeLog track by $index">{{chg}}</div>
  </div>
  `
})
export class OnChangesComponent implements OnChanges {
  @Input('<') hero: Hero;
  @Input('<') power: string;

  changeLog: string[] = [];

  ngOnChanges(changes: SimpleChanges) {
    for (let propName in changes) {
      let prop = changes[propName];
      let cur  = JSON.stringify(prop.currentValue);
      let prev = JSON.stringify(prop.previousValue);
      this.changeLog.push(`OnChanges: ${propName}: currentValue = ${cur}, previousValue = ${prev}`);
    }
  }

  reset() { this.changeLog.length = 0; }
}

/***************************************/

@Component({
  selector: 'on-changes-parent',
  moduleId: module.id,
  templateUrl: './on-changes-parent.component.html',
  directives: [OnChangesComponent]
})
export class OnChangesParentComponent {
  hero: Hero;
  power: string;
  title = 'OnChanges';
  @ViewChild(OnChangesComponent) childView: OnChangesComponent;

  constructor() {
    this.reset();
  }

  reset() {
    // new Hero object every time; triggers onChanges
    this.hero = new Hero('Windstorm');
    // setting power only triggers onChanges if this value is different
    this.power = 'sing';
    if (this.childView) { this.childView.reset(); }
  }
}


/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license
 */
