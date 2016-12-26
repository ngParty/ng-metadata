import * as angular from 'angular';
import { Component, Input, Output } from 'ng-metadata/core';

@Component({
  selector:'my-tester',
  template:`
  <h4>Tester Cmp</h4>
  <pre>
  {{ $ctrl.inOne | json }}
  {{ $ctrl.outOne | json }}
  {{ $ctrl.attrOne | json }}
  </pre>
  <button ng-click="$ctrl.outOne();$event.stopPropagation();">exec outOne</button>
  <hr>
  <ng-transclude></ng-transclude>
  <fieldset my-global-listener>
    <div>
      <label>TWO WAY</label>
      <input type="text" ng-model="$ctrl.twoWay">
    </div>
    <div>
      <label>ONE WAY</label>
      <input type="text" ng-model="$ctrl.oneWay">
    </div>
  </fieldset>
  `,
  legacy:{transclude:true}
})
export class TesterComponent{
  @Input() twoWay;
  @Input('<') oneWay;
  @Input('<') inOne = { name:'Martin' };
  @Input('@') attrOne = 'hello default';
  @Output() outOne = ()=>{ console.log( 'boooo' ) };

  constructor(){
    console.info( '===Tester CMP ctor====' );
    console.log( this.outOne.toString() );
    console.log( angular.toJson( this, true ) );
  }

  // ngOnInit(){
  //   console.info( '===Tester CMP, OnInit====' );
  //   console.log( this.outOne.toString() );
  //   console.log( angular.toJson(this,true) );
  // }

  ngOnChanges(changes){
    console.info( '====Tester CMP, OnChanges:===', changes );
  }

  ngDoCheck(){
    console.count('===Tester CMP, DoCheck===');
  }

}
