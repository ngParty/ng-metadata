import { Inject, Directive, OnInit } from 'ng-metadata/core';

type MDLcomponentHandler = {
  upgradeAllRegistered()
}

const componentHandler: MDLcomponentHandler = window[ 'componentHandler' ];

@Directive( {
  selector: '[element-ready]'
} )
export class ElementReadyDirective implements OnInit {

  constructor(
    @Inject( '$element' ) private $element: ng.IAugmentedJQuery,
    @Inject( '$scope' ) private $scope: ng.IScope
  ) {}

  ngOnInit() {

    this.$element.ready( ()=> {

      this.$scope.$apply( ()=> {

        componentHandler.upgradeAllRegistered();

      } );

    } );

    //this.$scope.$watch( componentHandler.upgradeAllRegistered )

  }
  }

}
