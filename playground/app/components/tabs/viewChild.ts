import { forwardRef,Component, Input,Inject,Host, OnChildrenChanged, AfterViewInit, OnDestroy } from 'ng-metadata/core';
import { TabsComponent } from './tabs';


@Component({
  selector:'tabs-child',
  template:(
    `<h5>Tabs child #{{ $ctrl.id }}!</h5>`
  )
})
export class TabsChildComponent implements AfterViewInit, OnDestroy{
  @Input() id:number;

  constructor(
    @Inject(forwardRef(()=>TabsComponent)) @Host() private tabs: TabsComponent
  ){}

  ngAfterViewInit(){}
  
  ngOnDestroy(){}

}
