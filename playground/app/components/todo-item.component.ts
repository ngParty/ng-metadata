import { Component, Input, Output, OnChanges } from 'ng-metadata/core';
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
  @Output() onDone: ( todo: {todo:TodoModel} )=>void;

  ngOnInit(){}

  ngOnChanges(change){
    console.log('changes:', change);
    if(change.todo){
      console.log('first todo change?', change.todo.isFirstChange());
    }
    if(change.idx){
      console.log('first idx change?', change.idx.isFirstChange());
    }

  }

  done(todo: TodoModel) {

    this.onDone( { todo } );

  }

}
