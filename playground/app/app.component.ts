import { Component, Inject, OnInit } from 'ng-metadata/core';
import { DynamicValueToken, NgRxStore, SomeFactoryFnToken, SomeClassToInstantiate } from './index';


@Component( {
  selector: 'my-app',
  moduleId: module.id,
  templateUrl: './app.component.html'
} )
export class AppComponent implements OnInit {
  constructor(
    private store: NgRxStore,
    @Inject(SomeFactoryFnToken) private myFactory: ()=>SomeClassToInstantiate,
    @Inject(DynamicValueToken) private dynamicValue: string
  ) { }

  ngOnInit() {
    console.info('===> provider(value) registered within config:',this.dynamicValue);
    console.info('===> provider(service) registered within config:', this.store, this.store.getState());
    console.info('factory:',this.myFactory);
    console.assert(this.myFactory() !== this.myFactory(),'factory must return different instance every time');
    const someClassInstance = this.myFactory();
    someClassInstance.greetWithDelay();
  }

  items = ['OOONE','TTTTTWO','THREEEE'];
  removeItem(item){
    const idx = this.items.indexOf(item);
    if(idx!==-1){
      this.items.splice(idx,1);
    }
  }
  addItem(){
    const newId = this.items[this.items.length-1]+Date.now();
    this.items.push(newId);
  }

  directive = {
    example: {
      interpolated: 'Ng Meta yo!',
      binding: { name: 'Moo', age: 123 },
      cb: ( from ) => {
        console.log( `callback baby! from ${from}` );
      }
    },
    changeValues: () => {
      this.directive.example.cb = ( from ) => { console.log( `callback from ${from}, but changed!!!` ) };
      this.directive.example.interpolated = 'changed yo!';
      this.directive.example.binding = { foo: 'bar' } as any;
    }
  };

  cmpTester = {
    model: { name: 'matt murdock' },
    interpolate: 'one batch, two batch',
    cb: ()=>console.log( 'bang!' ),
    changeValues: ( $event: ng.IAngularEvent )=> {
      $event.stopPropagation();
      this.cmpTester.model = { name: 'electra' };
      this.cmpTester.interpolate = 'hells kitchen is here';
    }
  };

  twoWay = 'hello';

}
