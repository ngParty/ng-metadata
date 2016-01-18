import { Component, Output } from 'ng-metadata/core';
import { TodoModel } from '../stores/todoStore.service.ts';

@Component({
  selector: 'add-todo',
  templateUrl: './app/components/add-todo.html'
})
export class AddTodoCmp{

  @Output() onAdd: ( todo: {todo:TodoModel} )=>void;

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

      this.onAdd( { todo } );
      this.label = '';

    }

    event.preventDefault();

  }

}
