import { Pipe } from 'ng-metadata/core';
import { TodoModel } from './todo-store.service';

@Pipe( {
  name: 'remainingTodos'
} )
export class RemainingTodosPipe {

  transform( todos: TodoModel[] = [] ): string {


    // method to iterate the todo items and return
    // a filtered Array of incomplete items
    // we then capture the length to display 1 of 3
    // for example
    const remaining = todos.filter( ( item: TodoModel )=> {
      return !item.complete;
    } ).length;

    const total = todos.length;

    return `( ${ remaining } of ${ total } )`;

  }

}
