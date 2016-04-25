import { Component, Inject, EventHandler } from 'ng-metadata/core';
import { TodoModel, TodoStore } from '../stores/todoStore.service';

@Component( {
  selector: 'todo-app',
  templateUrl: './app/components/todo-app.html',
  legacy:{transclude:true}
} )
export class TodoAppCmp{

  todos: TodoModel[];

  constructor(
    private todoStore: TodoStore
  ) {
    this.todos = this.todoStore.todos;
  }

  ngAfterViewInit(){
    console.info('viewINit');

  }
  ngAfterContentInit(){

    console.info('contentINit');
  }

  createTodo( todo: TodoModel ) {

    this.todos.unshift( todo );

    this._updateStore();

  }

  // we simply splice it from the Array using the $index
  removeTodo( todo: TodoModel ) {

    const idx = this.todos.indexOf( todo );
    this.todos.splice( idx, 1 );

    this._updateStore();

  }

  markAsDone( todo: TodoModel ) {
    console.log("HANDLE on-done (with a simple method without typed EventHandler)", todo);
    const todoToMarkAsDone = this.todos.filter( (todoItem)=>todoItem.label===todo.label );
    todoToMarkAsDone[0].complete = todo.complete;

    this._updateStore();

  }

  private _updateStore(){

    this.todoStore.todos = this.todos;

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

  outputWithEmitReceiver: EventHandler<string> = ( sentence ) => {
    console.info("HANDLE emit-test (explicit EventHandler typed function)",sentence);
  }


  directive = {
    example: {
      interpolated: 'Ng Meta yo!',
      binding: { name: 'Moo', age: 123 },
      cb: (from) => {
        console.log(`callback baby! from ${from}`);
      }
    },
    changeValues: () => {
      this.directive.example.cb = (from) => { console.log(`callback from ${from}, but changed!!!`) };
      this.directive.example.interpolated = 'changed yo!';
      this.directive.example.binding = { foo: 'bar' } as any;
    }
  };

  cmpTester = {
    model: {name:'matt murdock'},
    interpolate: 'one batch, two batch',
    cb: ()=>console.log( 'bang!' ),
    changeValues: ($event: ng.IAngularEvent)=>{
      $event.stopPropagation();
      this.cmpTester.model = {name:'electra'};
      this.cmpTester.interpolate = 'hells kitchen is here';
    }
  };

  twoWay='hello';



}

console.dir(TodoAppCmp)
