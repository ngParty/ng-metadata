import {Injectable} from 'ng-metadata/core';

export type TodoModel = {
  label: string,
  complete: boolean
}

@Injectable()
export class TodoStore {

  // have some dummy data for the todo list
  // complete property with Boolean values to display
  // finished todos
  private _todos: TodoModel[] = [
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

  get todos() {

    return angular.copy( this._todos );

  }

  set todos( value ) {

    this._todos = angular.copy( value );

  }

}
