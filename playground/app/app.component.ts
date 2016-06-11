import { Component, OnInit } from 'ng-metadata/core';
import { TodoAppCmp } from './todo/todo-app.component';

@Component( {
  selector: 'my-app',
  directives: [ TodoAppCmp ],
  templateUrl: './app/app.component.html'
} )
export class AppComponent implements OnInit {
  constructor() { }

  ngOnInit() { }

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
