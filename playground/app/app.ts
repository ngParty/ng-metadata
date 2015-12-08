//import * as angular from 'angular';
import 'angular';
import { provide, makeDirective, makePipe } from 'ng-metadata/ng-metadata';
import { TodoAppCmp } from './todo-app.component';
import { AddTodoCmp } from './add-todo.component';
import { TodoListCmp } from './todo-list.component';
import { TodoItemCmp } from './todo-item.component';
import { RemainingTodosPipe } from './remainingTodos.pipe';

import { ElementReadyDirective } from './element-ready.directive';

export const AppModule = angular.module( 'app', [] )
  .directive( provide( TodoAppCmp ), makeDirective( TodoAppCmp ) )
  .directive( provide( AddTodoCmp ), makeDirective( AddTodoCmp ) )
  .directive( provide( TodoListCmp ), makeDirective( TodoListCmp ) )
  .directive( provide( TodoItemCmp ), makeDirective( TodoItemCmp ) )

  .filter( provide( RemainingTodosPipe ), makePipe( RemainingTodosPipe ) )

  .directive( provide( ElementReadyDirective ), makeDirective( ElementReadyDirective ) );
