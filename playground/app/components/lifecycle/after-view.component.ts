import {
  AfterViewChecked,
  AfterViewInit,
  OnDestroy,
  Component,
  ViewChild,
  Inject,
  Host,
  forwardRef
} from 'ng-metadata/core';

import { NgTimeout } from '../../shared/index';
import { LoggerService }  from './logger.service';

//////////////////
@Component( {
  selector: 'my-child-view',
  template: '<input ng-model="$ctrl.hero" ng-change="$ctrl.notifyParent()" ng-blur="$ctrl.notifyParent()">'
} )
export class ChildViewComponent {
  hero = 'Magneta';

  constructor(
    // we need to use forwardRef because the three hierarchy
    @Host() @Inject( forwardRef( ()=>AfterViewComponent ) ) private afterViewCmp: AfterViewComponent
  ) {}

  notifyParent() {
    // NOTE: we have to manually notify parent, in Angular 2 this is done by the framework automatically
    // in Angular 1, #ngAfterViewChecked from parent will be automatically called only during child instantiation/removal
    this.afterViewCmp.ngAfterViewChecked();
  }
}

//////////////////////
@Component( {
  selector: 'after-view',
  template: `
    <button ng-click="$ctrl.toggleChild()">Toggle Child</button>
    <div>-- child view begins --</div>
      <my-child-view ng-if="$ctrl.show"></my-child-view>
    <div>-- child view ends --</div>
    
    <p ng-if="$ctrl.comment" class="comment">
      {{$ctrl.comment}}
    </p>
  `,

  directives: [ ChildViewComponent ]
} )
export class AfterViewComponent implements AfterViewChecked, AfterViewInit {

  private prevHero = '';
  comment = '';
  show = true;

  // Query for a VIEW child of type `ChildViewComponent`
  @ViewChild( ChildViewComponent ) viewChild: ChildViewComponent;

  constructor( private $timeout: NgTimeout, private logger: LoggerService ) {
    this.logIt( 'AfterView constructor' );
  }

  ngAfterViewInit() {
    // viewChild is set after the view has been initialized
    this.logIt( 'AfterViewInit' );
    this.doSomething();
  }

  ngAfterViewChecked() {
    const vc = this.viewChild;

    // viewChild is updated after the view has been checked
    if ( vc && this.prevHero === vc.hero ) {
      this.logIt( 'AfterViewChecked (no change)' );
    } else {
      this.prevHero = vc && vc.hero;
      this.logIt( 'AfterViewChecked' );
      this.doSomething();
    }
  }

  toggleChild() {
    this.show = !this.show;
  }

  // This surrogate for real business logic sets the `comment`
  private doSomething() {
    if ( !this.viewChild ) return;

    const c = this.viewChild.hero.length > 10
      ? `That's a long name`
      : '';
    if ( c !== this.comment ) {
      // Wait a tick because the component's view has already been checked
      this.$timeout( () => this.comment = c, 0 );
    }
  }

  private logIt( method: string ) {
    const vc = this.viewChild;
    let message = `${method}: ${vc
      ? vc.hero
      : 'no'} child view`;
    this.logger.log( message );
  }

}

//////////////
@Component( {
  selector: 'after-view-parent',
  template: `
  <div class="parent">
    <h2>AfterView</h2>

    <after-view  ng-if="$ctrl.show"></after-view>

    <h4>-- AfterView Logs --</h4>
    <p>
      <button ng-click="$ctrl.reset()">Reset</button>
    </p>
    <div ng-repeat="msg in $ctrl.logs track by $index">{{msg}}</div>
  </div>
  <style>after-view-parent > .parent {background: burlywood}</style>
  `,
  providers: [ LoggerService ],
  directives: [ AfterViewComponent ]
} )
export class AfterViewParentComponent implements OnDestroy {
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

    // quickly remove and reload AfterViewComponent which recreates it
    this.show = false;
    this.$timeout( () => this.show = true, 0 )
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
