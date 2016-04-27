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
  @Output() onDone: EventEmitter<TodoModel>; // used as an interface 
  @Output() emitTest = new EventEmitter<string>(); // use class instance

  ngOnInit(){

    const dispose = this.onDone.subscribe( (value)=> {
      console.log(`Sample SIDE EFFECT: onDone emitted value: ${JSON.stringify(value)}` );
      console.warn("DISPOSE SIDE EFFECT so it's called only first time...");
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
    console.info("EMIT 'emitTest' via new EventEmitter class");
    this.emitTest.emit( 'hello from eventEmitter instance!' );
  }

  done(todo: TodoModel) {
    console.info("EMIT 'onDone' via EventEmitter interface");
    this.onDone.emit( todo );

  }

}
