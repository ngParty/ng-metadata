import { Component, Input, Output, OnChanges, EventEmitter } from 'ng-metadata/core';
import { TodoModel } from '../stores/todoStore.service';

@Component({
  selector: 'todo-item',
  templateUrl: './app/components/todo-item.html',
  legacy: {
    transclude: true
  }
})
export class TodoItemCmp implements OnChanges{

  @Input('<') todo: TodoModel;
  @Input('<') idx: number;
  // this is old way how to bindings are created, will be removed in 2.0
  // @Output() onDone: ( todo: {todo:TodoModel} )=>void;
  @Output() onDone: EventEmitter<TodoModel>;
  @Output() emitTest = new EventEmitter<string>();

  ngOnInit(){

    const dispose = this.onDone.subscribe( (value)=> {
      console.log( `onDone emitted value: ${value}` );
      dispose();
    } )

  }

  ngOnChanges(change){
    console.log('changes:', change);
    if(change.todo){
      console.log('first todo change?', change.todo.isFirstChange());
    }
    if(change.idx){
      console.log('first idx change?', change.idx.isFirstChange());
    }

  }

  callEmit(){
    this.emitTest.emit( 'hello from eventEmitter instance!' );
  }

  done(todo: TodoModel) {

    this.onDone.emit( todo );

  }

}
