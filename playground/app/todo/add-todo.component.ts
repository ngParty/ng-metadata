import { Component, Output, EventEmitter } from 'ng-metadata/core';
import { TodoModel } from './todo-store.service';

@Component({
  selector: 'add-todo',
  moduleId: module.id,
  templateUrl: './add-todo.html'
})
export class AddTodoCmp{

  @Output() onAdd = new EventEmitter<TodoModel>();

  // set an empty Model for the <input>
  label: string = '';

  // the submit event for the <form> allows us to type and
  // press enter instead of ng-click on the <button> element
  // we capture $event and prevent default to prevent form submission
  // and if the label has a length, we'll call binding expression.
  //
  // we'll then set this.label back to an empty String
  addTodo( event: ng.IAngularEvent, label: string ) {

    if ( label.length ) {

      const todo = {
        label,
        complete: false
      };

      this.onAdd.emit( todo );
      this.label = '';

    }

    event.preventDefault();

  }

}
