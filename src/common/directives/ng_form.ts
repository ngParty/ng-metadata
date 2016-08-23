import { Directive } from '../../core/directives/decorators';

@Directive( { selector: 'form' } )
export abstract class NgForm implements ng.IFormController {
  $pristine: boolean;
  $dirty: boolean;
  $valid: boolean;
  $invalid: boolean;
  $submitted: boolean;
  $error: any;
  $name: string;
  $pending: any;

  $addControl( control: angular.INgModelController ): void {}

  $removeControl( control: angular.INgModelController ): void {}

  $setValidity( validationErrorKey: string, isValid: boolean, control: angular.INgModelController ): void {}

  $setDirty(): void {}

  $setPristine(): void {}

  $commitViewValue(): void {}

  $rollbackViewValue(): void {}

  $setSubmitted(): void {}

  $setUntouched(): void {}

}
