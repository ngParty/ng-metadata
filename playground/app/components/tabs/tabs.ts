import {
  Inject,
  Host,
  Component,
  ViewChild,
  ViewChildren,
  ContentChild,
  ContentChildren,
  AfterViewInit,
  AfterViewChecked,
  AfterContentInit,
  AfterContentChecked,
  OnChildrenChanged
} from 'ng-metadata/core';
import { TabsChildComponent } from './viewChild';
import { TabsContentComponent } from './contentChild';

@Component( {
  selector: 'tabs',
  template: (
    `<div>
    <h4>Tabs!</h4>
    <button ng-click="$ctrl.addItem()">add viewChild</button>
    <tabs-child id="0"></tabs-child>
    <ul><li ng-repeat="item in $ctrl.items">
      <tabs-child id="item"></tabs-child>
      <button ng-click="$ctrl.removeItem(item)">remove</button>
    </li></ul>
    <div ng-transclude=""></div>
    <hr>
    <h6>viewChildred</h6>
    <pre>{{ $ctrl.tabsChildren.length }}</pre>
    <h6>contentChildren</h6>
    <pre>{{ $ctrl.tabsContents.length }}</pre>
    </div>`
  ),
  //directives: [ TabsChildComponent ],
  legacy: {
    transclude: true
  }
} )
export class TabsComponent implements AfterViewChecked,AfterContentChecked,AfterContentInit,AfterViewInit{

  @ViewChild( TabsChildComponent )
  firstTabsChild: TabsChildComponent;

  @ViewChildren( TabsChildComponent )
  tabsChildren: TabsChildComponent[];
  
  @ViewChildren( 'h6' )
  h6titles: ng.IAugmentedJQuery;

  @ContentChild( TabsContentComponent )
  firstTabsContent: TabsContentComponent;

  @ContentChildren( TabsContentComponent )
  tabsContents: TabsContentComponent[];

  ngAfterViewInit(){
    console.info('hello from prototype.ngAfterViewInit',this);
    console.log(this.h6titles);
     
  }
  ngAfterContentInit(){
    console.info('hello from prototype.ngAfterContentInit',this);
  }
  ngAfterViewChecked(){
    console.log('hello from prototype.ngAfterViewChecked');
  }
  ngAfterContentChecked(){
    console.log('hello from prototype.ngAfterContentChecked');
  }





  items = [11,22,33];



  removeItem(item){
    const idx = this.items.indexOf(item);
    if(idx!==-1){
      this.items.splice(idx,1);
    }
  }

  addItem(){
    const newId = this.items[this.items.length-1]+2;
    this.items.push(newId);
  }

}
