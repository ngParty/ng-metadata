import { Component, EventHandler } from 'ng-metadata/core';

import { TodoModel, TodoStore } from './todo-store.service';
import { AddTodoCmp } from './add-todo.component';
import { TodoItemCmp } from './todo-item.component';
import { RemainingTodosPipe } from './remaining-todos.pipe'

@Component( {
  selector: 'todo-app',
  moduleId: module.id,
  templateUrl: './todo-app.html',
  directives: [ AddTodoCmp, TodoItemCmp ],
  providers: [ TodoStore ],
  pipes: [ RemainingTodosPipe ],
  legacy: { transclude: true }
} )
export class TodoAppCmp{

  todos: TodoModel[];

  constructor( private todoStore: TodoStore ) {
    this.todos = this.todoStore.todos;
  }

  ngAfterViewInit(){
    console.info('viewInit');
  }
  ngAfterContentInit(){
    console.info('contentInit');
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

  outputWithEmitReceiver: EventHandler<string> = ( sentence ) => {
    console.info("HANDLE emit-test (explicit EventHandler typed function)",sentence);
  }


}
