import { Component } from 'ng-metadata/ng-metadata';

export type TodoModel = {
  label: string,
  complete: boolean
}

@Component( {
  selector: 'todo-app',
  templateUrl: './app/todo-app.html'
} )
export class TodoAppCmp{

  // have some dummy data for the todo list
  // complete property with Boolean values to display
  // finished todos
  todos: TodoModel[] = [
    {
      label: 'Learn Angular',
      complete: false
    }, {
      label: 'Deploy to S3',
      complete: true
    }, {
      label: 'Rewrite Todo Component',
      complete: true
    }
  ];

  constructor() {}

  createTodo( todo: TodoModel ) {

    this.todos.unshift( todo );

  }

  // we simply splice it from the Array using the $index
  removeTodo( todo: TodoModel ) {

    const idx = this.todos.indexOf( todo );
    this.todos.splice( idx, 1 );

  }

  markAsDone( todo: TodoModel ) {

    const todoToMarkAsDone = this.todos.filter( (todoItem)=>todoItem.label===todo.label );
    todoToMarkAsDone[0].complete = todo.complete;

  }


}
