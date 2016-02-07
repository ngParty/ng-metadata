import { Component, Inject } from 'ng-metadata/core';
import { TodoModel, TodoStore } from '../stores/todoStore.service';

@Component( {
  selector: 'todo-app',
  templateUrl: './app/components/todo-app.html',
  legacy:{transclude:true}
} )
export class TodoAppCmp{

  todos: TodoModel[];

  constructor(
    @Inject(TodoStore) private todoStore: TodoStore
  ) {

    this.todos = this.todoStore.todos;
  }
  
  ngAfterViewInit(){
    console.info('viewINit');
    
  }
  ngAfterContentInit(){
    
    console.info('contentINit');
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

    const todoToMarkAsDone = this.todos.filter( (todoItem)=>todoItem.label===todo.label );
    todoToMarkAsDone[0].complete = todo.complete;

    this._updateStore();

  }

  private _updateStore(){

    this.todoStore.todos = this.todos;

  }

  items = ['OOONE','TTTTTWO','THREEEE'];
  removeItem(item){
    const idx = this.items.indexOf(item);
    if(idx!==-1){
      this.items.splice(idx,1);
    }
  }
  addItem(){
    const newId = this.items[this.items.length-1]+Date.now();
    this.items.push(newId);
  }



}
