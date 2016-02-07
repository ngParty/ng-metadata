import { forwardRef,Component, Input,Inject,Host, OnChildrenChanged, AfterViewInit, OnDestroy } from 'ng-metadata/core';
import { TabsComponent } from './tabs';

@Component({
  selector:'tabs-content-child',
  template:(
    `<h5>Tabs CONTENT child! #{{ $ctrl.id }}</h5>`
  )
})
export class TabsContentComponent implements OnChildrenChanged,AfterViewInit, OnDestroy{
  @Input() id: string;

  constructor(
    @Inject(forwardRef(()=>TabsComponent)) @Host() private tabs: TabsComponent
  ){}

}
