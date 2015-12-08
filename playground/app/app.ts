//import * as angular from 'angular';
import 'angular';
import { provide, makeDirective, makePipe } from 'ng-metadata/ng-metadata';

import { TodoAppCmp } from './components/todo-app.component';
import { TodoItemCmp } from './components/todo-item.component';
import { AddTodoCmp } from './components/add-todo.component';

import { RemainingTodosPipe } from './pipes/remainingTodos.pipe';

import { TodoStore } from './stores/todoStore.service';

import { ElementReadyDirective } from './directives/element-ready.directive';

export const AppModule = angular.module( 'app', [] )

  .directive( provide( TodoAppCmp ), makeDirective( TodoAppCmp ) )
  .directive( provide( AddTodoCmp ), makeDirective( AddTodoCmp ) )
  .directive( provide( TodoItemCmp ), makeDirective( TodoItemCmp ) )

  .filter( provide( RemainingTodosPipe ), makePipe( RemainingTodosPipe ) )

  .service( provide( TodoStore ), TodoStore )

  .directive( provide( ElementReadyDirective ), makeDirective( ElementReadyDirective ) );
