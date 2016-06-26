import { Component, Input, Output, OnChanges, EventEmitter } from 'ng-metadata/core';
import { TodoModel } from './todo-store.service';

@Component({
  selector: 'todo-item',
  moduleId: module.id,
  templateUrl: './todo-item.html',
  legacy: {
    transclude: true
  }
})
export class TodoItemCmp implements OnChanges{

  @Input() todo: TodoModel;
  @Input() idx: number;
  @Output() onDone = new EventEmitter<TodoModel>();
  @Output() emitTest = new EventEmitter<string>();

  ngOnInit(){

    const subscription = this.onDone.subscribe( (value)=> {
      console.log(`Sample SIDE EFFECT: onDone emitted value: ${JSON.stringify(value)}` );
      console.warn(`DISPOSE SIDE EFFECT so it's called only first time...`);
      subscription.unsubscribe();
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
