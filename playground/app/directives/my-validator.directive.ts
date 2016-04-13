import { forwardRef, Directive, Inject, Host, Self, SkipSelf, Optional, AfterContentInit,OnInit } from 'ng-metadata/core';
import {TodoStore} from '../stores/todoStore.service';
import { MyFooDirective } from './my-foo.directive';


@Directive({selector:'[my-validator]'})
export class MyValidatorDirective implements OnInit,AfterContentInit{
  constructor(
    @Inject( forwardRef(()=>MyFooDirective) ) @Self() private myFoo,
    @Inject('ngModel') @Host() private ngModelCtrl: ng.INgModelController,
    @Inject( TodoStore ) private todoSvc,
    @Inject('form') @Optional() @Self() private FormCtrl: ng.IFormController
  ){}


  ngOnInit(){
    console.log(this);
  }
  ngAfterContentInit(){
    console.log( this.todoSvc );
    this.ngModelCtrl.$validators["myValidator"] = (viewValue,modelValue)=>{
      return viewValue ==='Martin';
    }
  }

}
