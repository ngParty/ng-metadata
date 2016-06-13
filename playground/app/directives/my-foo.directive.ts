import { forwardRef, Directive, Inject, Host, Self, Optional, OnInit, AfterContentInit } from 'ng-metadata/core';
import { NgModel, NgForm } from 'ng-metadata/common';
import { MyValidatorDirective } from './my-validator.directive';
import {TodoStore} from '../todo/todo-store.service';

@Directive({selector:'[my-foo]'})
export class MyFooDirective implements OnInit,AfterContentInit{

  fooData={
    wot:'waaat',
    iss:'is',
    hot:'hot?'
  };

  constructor(
    @Host() private ngModelCtrl: NgModel,
    @Inject( forwardRef(()=>MyValidatorDirective) ) @Self() private myValidator: MyValidatorDirective,
    @Optional() @Self() private FormCtrl: NgForm,
    private todoSvc: TodoStore
  ){}

  ngOnInit(){
    console.log( this );
  }
  ngAfterContentInit(){
    console.log( this.todoSvc );
  }

}
