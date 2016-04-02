/**
 * @ngdoc directive
 * @name myDirectiveTester
 * @restrict A
 * @description
 *
 *
 * @usage
 * ```html
 * <div em-directive-tester></div>
 * ```
 *
 * @param {}
 */

import { Directive, Attr, Input, Output, Inject } from 'ng-metadata/core';

@Directive( {
  selector: '[my-directive-tester]',
} )
export class MyDirectiveTesterDirective {

  @Attr() pureString: string;
  @Attr() interpolated: string;

  @Input() binding: any;

  @Output() someCb: Function;

  constructor(@Inject('$attrs') private $attrs){
    console.log('constructor', JSON.stringify(this,null,2));
    this.someCb({ from: 'constructor' });
  }
  ngOnInit(){
    console.log('ngOnInit', this);
    this.someCb({ from: 'onInit' })
  }
  ngAfterContentInit() {
    console.log('ngAfterContentInit', this);
    this.someCb({from:'afterContentInit'})
  }


}
