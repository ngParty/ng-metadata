import { forwardRef, Directive, Inject, Host, Self, Optional, OnInit, AfterContentInit } from 'ng-metadata/core';
import { MyValidatorDirective } from './my-validator.directive';
import {TodoStore} from '../stores/todoStore.service';

@Directive({selector:'[my-foo]'})
export class MyFooDirective implements OnInit,AfterContentInit{

  fooData={
    wot:'waaat',
    iss:'is',
    hot:'hot?'
  };

  constructor(
    @Inject('ngModel') @Host() private ngModelCtrl: ng.INgModelController,
    @Inject( forwardRef(()=>MyValidatorDirective) ) @Self() private myValidator,
    @Inject('form') @Optional() @Self() private FormCtrl: ng.IFormController,
    @Inject( TodoStore ) private todoSvc
  ){}

  ngOnInit(){
    console.log( this );
  }
  ngAfterContentInit(){
    console.log( this.todoSvc );
  }

}
