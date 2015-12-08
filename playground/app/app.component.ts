import {Component} from 'ng-metadata/ng-metadata';

@Component( {
  selector: 'app',
  templateUrl: './app/app.html'
} )
export class AppCmp {

  todosForm: ng.IFormController;

  label: string;
  todos: any[];
  updateIncomplete: Function;
  deleteItem: Function;
  onSubmit: Function;

  constructor() {

    // set an empty Model for the <input>
    this.label = '';
    // have some dummy data for the todo list
    // complete property with Boolean values to display
    // finished todos
    this.todos = [
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
    // method to iterate the todo items and return
    // a filtered Array of incomplete items
    // we then capture the length to display 1 of 3
    // for example
    this.updateIncomplete = function () {
      return this.todos.filter( ( item )=> {
        return !item.complete;
      } ).length;
    };
    // each todo item contains a ( X ) button to delete it
    // we simply splice it from the Array using the $index
    this.deleteItem = function ( index ) {
      this.todos.splice( index, 1 );
    };
    // the submit event for the <form> allows us to type and
    // press enter instead of ng-click on the <button> element
    // we capture $event and prevent default to prevent form submission
    // and if the label has a length, we'll unshift it into the this.todos
    // Array which will then add the new todo item into the list
    // we'll then set this.label back to an empty String
    this.onSubmit = function ( event ) {
      if ( this.label.length ) {
        this.todos.unshift( {
          label: this.label,
          complete: false
        } );
        this.label = '';
      }
      event.preventDefault();
    };

  }


}
