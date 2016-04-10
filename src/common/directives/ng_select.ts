import { Directive } from '../../core/directives/decorators';

@Directive( { selector: 'select' } )
export abstract class NgSelect {

  // If the ngModel doesn't get provided then provide a dummy noop version to prevent errors
  ngModelCtrl: ng.INgModelController;

  // The "unknown" option is one that is prepended to the list if the viewValue
  // does not match any of the options. When it is rendered the value of the unknown
  // option is '? XXX ?' where XXX is the hashKey of the value that is not known.
  //
  // We can't just jqLite('<option>') since jqLite is not smart enough
  // to create it in <select> and IE barfs otherwise.
  unknownOption: ng.IAugmentedJQuery;

  renderUnknownOption( val: string ): void {}

  removeUnknownOption(): void {}


  // Read the value of the select control, the implementation of this changes depending
  // upon whether the select can have multiple values and whether ngOptions is at work.
  abstract readValue(): string

  // Write the value to the select control, the implementation of this changes depending
  // upon whether the select can have multiple values and whether ngOptions is at work.
  writeValue(value: string): void {}


  // Tell the select control that an option, with the given value, has been added
  addOption(value: string, element: ng.IAugmentedJQuery): void {}

  // Tell the select control that an option, with the given value, has been removed
  removeOption( value: any ): void {}

  // Check whether the select control has an option matching the given value
  abstract hasOption( value: any ): boolean

  registerOption(
    optionScope: ng.IScope,
    optionElement: ng.IAugmentedJQuery,
    optionAttrs: ng.IAttributes,
    interpolateValueFn?: Function,
    interpolateTextFn?: Function
  ): void {}

}
