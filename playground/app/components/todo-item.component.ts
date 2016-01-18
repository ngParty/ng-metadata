import { Component, Input, Output } from 'ng-metadata/core';
import { TodoModel } from '../stores/todoStore.service';

@Component({
  selector: 'todo-item',
  templateUrl: './app/components/todo-item.html',
  legacy: {
    transclude: true
  }
})
export class TodoItemCmp{

  @Input('todo') _todo: TodoModel;
  @Input() idx: number;
  @Output() onDone: ( todo: {todo:TodoModel} )=>void;

  todo: TodoModel;

  constructor(){

    this.todo = angular.copy( this._todo );

  }

  done(todo: TodoModel) {

    this.onDone( { todo } );

  }

}
