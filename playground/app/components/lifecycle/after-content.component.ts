import {
  AfterContentChecked,
  AfterContentInit,
  OnDestroy,
  Component,
  ContentChild,
  Inject,
  Host,
  forwardRef
} from 'ng-metadata/core';

import { NgTimeout } from '../../shared/index';
import { LoggerService }  from './logger.service';

//////////////////
@Component( {
  selector: 'my-child-content',
  template: `<input ng-model="$ctrl.hero" ng-change="$ctrl.notifyParent()" ng-blur="$ctrl.notifyParent()">`
} )
export class ChildContentComponent {
  hero = 'Magneta';

  constructor(
    // we need to use forwardRef because the three hierarchy
    @Host() @Inject( forwardRef( ()=>AfterContentComponent ) ) private afterContentCmp: AfterContentComponent
  ) {}

  notifyParent() {
    // NOTE: we have to manually notify parent, in Angular 2 this is done by the framework automatically
    // in Angular 1, #ngAfterContentChecked from parent will be automatically called only during child instantiation/removal
    this.afterContentCmp.ngAfterContentChecked();
  }

}

//////////////////////
@Component( {
  selector: 'after-content',
  template: `
    <button ng-click="$ctrl.toggleChild()">Toggle Child</button>
    <div>-- projected content begins --</div>
      <ng-transclude ng-if="$ctrl.show"></ng-transclude>
    <div>-- projected content ends --</div>
    
    <p ng-if="$ctrl.comment" class="comment">
      {{$ctrl.comment}}
    </p>
  `,
  legacy: {
    transclude: true
  }
} )
export class AfterContentComponent implements AfterContentChecked, AfterContentInit {
  private prevHero = '';
  comment = '';
  show = true;

  // Query for a CONTENT child of type `ChildContentComponent`
  @ContentChild( ChildContentComponent ) contentChild: ChildContentComponent;

  constructor( private logger: LoggerService ) {
    this.logIt( 'AfterContent constructor' );
  }

  ngAfterContentInit() {
    // viewChild is set after the view has been initialized
    this.logIt( 'AfterContentInit' );
    this.doSomething();
  }

  ngAfterContentChecked() {
    const cch = this.contentChild;
    // viewChild is updated after the view has been checked
    if ( cch && this.prevHero === cch.hero ) {
      this.logIt( 'AfterContentChecked (no change)' );
    } else {
      this.prevHero = cch && cch.hero;
      this.logIt( 'AfterContentChecked' );
      this.doSomething();
    }
  }

  toggleChild() {
    this.show = !this.show;
  }

  // This surrogate for real business logic sets the `comment`
  private doSomething() {
    if ( !this.contentChild ) return;
    this.comment = this.contentChild.hero.length > 10
      ? 'That\'s a long name'
      : '';
  }

  private logIt( method: string ) {
    const cch = this.contentChild;
    const message = `${method}: ${cch
      ? cch.hero
      : 'no'} child view`;
    this.logger.log( message );
  }
}

//////////////
@Component( {
  selector: 'after-content-parent',
  template: `
  <div class="parent">
    <h2>AfterContent</h2>

    <div ng-if="$ctrl.show">
    
      <after-content>
        <my-child-content></my-child-content>
      </after-content>
      
    </div>

    <h4>-- AfterContent Logs --</h4>
    <p>
      <button ng-click="$ctrl.reset()">Reset</button>
    </p>
    <div ng-repeat="msg in $ctrl.logs track by $index">{{msg}}</div>
  </div>
  <style>after-content-parent > .parent {background: burlywood}</style>
  `,
  providers: [ LoggerService ],
  directives: [ AfterContentComponent, ChildContentComponent ]
} )
export class AfterContentParentComponent implements OnDestroy {
  logs: string[];
  show = true;

  constructor(
    private $timeout: NgTimeout,
    logger: LoggerService
  ) {
    this.logs = logger.logs;
  }

  reset() {
    this._emptyLog();
    // quickly remove and reload AfterContentComponent which recreates it
    this.show = false;
    this.$timeout( () => this.show = true, 0 );
  }

  ngOnDestroy() {
    this._emptyLog();
  }

  private _emptyLog() { this.logs.length = 0 }
}


/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license
 */
