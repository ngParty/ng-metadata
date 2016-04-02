import * as angular from 'angular';
import { provide } from 'ng-metadata/core';

import {TabsModule} from './components/tabs/index'

import { TodoAppCmp } from './components/todo-app.component';
import { TodoItemCmp } from './components/todo-item.component';
import { AddTodoCmp } from './components/add-todo.component';

import { RemainingTodosPipe } from './pipes/remainingTodos.pipe';

import { TodoStore } from './stores/todoStore.service';

import { ElementReadyDirective } from './directives/element-ready.directive';
import { MyValidatorDirective } from './directives/my-validator.directive';
import { MyFooDirective } from './directives/my-foo.directive';
import { MyFormBridgeDirective } from './directives/my-form-bridge.directive';
import { MyDirectiveTesterDirective } from './directives/my-directive-tester.directive';
import { TesterAttrDirective } from './directives/my-tester.directive';
import { TesterComponent } from './components/tester/tester.component';
export const AppModule = angular.module( 'app', [TabsModule] )

  .directive( ...provide( TodoAppCmp ) )
  .directive( ...provide( AddTodoCmp ) )
  .directive( ...provide( TodoItemCmp ) )
  .filter( ...provide( RemainingTodosPipe ) )
  .service( ...provide( TodoStore ) )

  .directive( ...provide( ElementReadyDirective ) )

  .directive( ...provide( MyValidatorDirective ) )
  .directive( ...provide( MyFooDirective ) )
  .directive( ...provide( MyFormBridgeDirective ) )
  .directive( ...provide( MyDirectiveTesterDirective ) )
  .directive( ...provide( TesterComponent ) )
  .directive( ...provide( TesterAttrDirective ) )
  /*.directive('myTesterAttr2',function(){
    return {
      restrict: 'A',
      bindToController: true,
      controllerAs:'__foo',
      controller: ['$scope','$element','$attrs','$injector',
      function _ctrl($scope:ng.IScope,$element,$attrs,$injector){

        class Foo{
          inOne = { name: 'default yo'};
          static $inject = [];
          constructor(){
            console.log( 'myTesterAttr', angular.toJson(this,true) );
          }
          ngOnInit(){
            console.info('heeeey Foo');
          }
        }

        let $ctrl = this;

        const $parse = $injector.get<ng.IParseService>('$parse');
        const $interpolate = $injector.get<ng.IInterpolateService>('$interpolate');

        const instance = Object.create( Foo.prototype );
        // Object.assign( instance, this );

        // bindings
        const parentGet = $parse($attrs['inOne']);
        $ctrl['inOne'] = parentGet($scope);
        // instance['inOne'] = $scope.$eval($attrs.inOne);
        $scope.$watch( parentGet, ( newParentValue ) => {
        // $scope.$watch( $attrs.inOne, ( newParentValue ) => {
          $ctrl[ 'inOne' ] = newParentValue;
        } );

        // const origInst = Object.assign({},instance);

        const result = $injector.invoke( Foo, instance, {} );

        Object.assign(this,instance);
        this.__proto__ = instance.__proto__;
        // Object.assign(this.prototype,)

      }],
      // link: {
      //   pre: angular.noop,
      //   post: function(s,e,a){}
      // }
    }
  })*/

  ;
