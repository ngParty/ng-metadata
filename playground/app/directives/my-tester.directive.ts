import * as angular from 'angular';
import { Directive, Input, Output, Attr, HostListener } from 'ng-metadata/core';

@Directive({
  selector:'[my-tester-attr]',
})
export class TesterAttrDirective{
  @Input() inOne = { name:'Martin from directive' };
  @Output() outOne = ()=>{ console.log( 'mooo from directive' ) };
  // @Output() outOne: Function;
  @Input('@') attrOne = 'hello default from directive';

  constructor(){
    console.log( '===Tester DIR, ctor====' );
    console.log( this.outOne.toString() );
    console.log( angular.toJson(this,true) );
  }

  ngOnInit(){
    console.log( '===Tester DIR, OnInit====' );
    console.log( this.outOne.toString() );
    console.log( angular.toJson(this,true) );
  }

  ngOnChanges(changes){
    console.log('TesterAttrDirective changes', changes);
  }

  @HostListener('click')
  onClick(){
    console.log( 'onClick called!', this );
    this.outOne();
  }
}
