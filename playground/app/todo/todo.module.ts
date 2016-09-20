import { NgModule } from 'ng-metadata/core';

import { TodoAppCmp } from './todo-app.component';
import { AddTodoCmp } from './add-todo.component';
import { TodoItemCmp } from './todo-item.component';

import { RemainingTodosPipe } from './remaining-todos.pipe'

@NgModule({
  imports: [],
  // exports, bootstrap, entryComponents have no real functionality yet
  exports: [TodoAppCmp],
  declarations: [TodoAppCmp, AddTodoCmp, TodoItemCmp, RemainingTodosPipe],
  entryComponents: [TodoAppCmp]
})
export class TodoAppModule{}
