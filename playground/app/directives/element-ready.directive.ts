import { Inject, Directive, AfterContentInit } from 'ng-metadata/core';

type MDLcomponentHandler = {
  upgradeAllRegistered()
}

const componentHandler: MDLcomponentHandler = window[ 'componentHandler' ];

@Directive( {
  selector: '[element-ready]'
} )
export class ElementReadyDirective implements AfterContentInit {

  constructor(
    @Inject( '$element' ) private $element: ng.IAugmentedJQuery,
    @Inject( '$scope' ) private $scope: ng.IScope
  ) {}

  ngAfterContentInit() {

    this.$element.ready( ()=> {

      this.$scope.$apply( ()=> {

        componentHandler.upgradeAllRegistered();

      } );

    } );

    //this.$scope.$watch( componentHandler.upgradeAllRegistered )

  }


}
