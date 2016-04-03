import { Component, Input, Output, Attr } from 'ng-metadata/core';

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
  <fieldset>
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
  @Input('<') oneWay;
  @Input() twoWay;
  @Input('<') inOne = { name:'Martin' };
  @Output() outOne = ()=>{ console.log( 'boooo' );};
  @Attr() attrOne = 'hello default';

  constructor(){
    console.log( '===Tester CMP ctor====' );
    console.log( this.outOne.toString() );
    console.log( angular.toJson( this, true ) );
  }

  ngOnInit(){
    console.log( '===Tester CMP, OnInit====' );
    console.log( this.outOne.toString() );
    console.log( angular.toJson(this,true) );
  }

  ngOnChanges(changes){
    console.log( 'TesterComponent changes:', changes );
  }

}
