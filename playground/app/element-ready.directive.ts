import { Inject, Directive, AfterContentInit } from 'ng-metadata/ng-metadata';


@Directive( {
  selector: '[element-ready]'
} )
export class ElementReadyDirective implements AfterContentInit {

  constructor(
    @Inject( '$element' ) private $element: ng.IAugmentedJQuery,
    @Inject( '$scope' ) private $scope: ng.IScope
  ) {}

  afterContentInit() {

    this.$element.ready( ()=> {

      this.$scope.$apply( ()=> {

        componentHandler.upgradeAllRegistered();

      } );

    } );

    this.$scope.$watch( componentHandler.upgradeAllRegistered )

  }


}
