import { Directive, Inject, Self, SkipSelf } from 'ng-metadata/core';

@Directive( { selector: '[my-form-bridge]' } )
export class MyFormBridgeDirective {
  constructor(
    @Inject( 'form' ) @Self() private form: ng.IFormController,
    @Inject( 'form' ) @SkipSelf() private parentForm: ng.IFormController
  ) {}

  ngOnInit(){
    console.log( this );
  }

}
