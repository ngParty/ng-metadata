import { expect } from 'chai';
import {DDO_METADATA_KEY} from '../src/directives';
import { Optional } from '../src/di/optional';
import { Host,REQUIRE_METADATA_KEY } from '../src/di/host';
import { Parent } from '../src/di/parent';
import { Inject } from '../src/di/inject';
import { Component, Directive } from '../src/directives';
import {linkFnMocks,createScope} from "../src/testing/utils";
import {AfterContentInit} from "../src/life_cycle";


describe( '@Host,@Parent,@Optional DI decorators', ()=> {

  let scope;
  let element;
  let attrs;
  let _invokeLink;
  let _destroyLink;

  beforeEach( function () {

    scope = createScope();
    element = {};
    attrs = {};
    const linkMocks = linkFnMocks( scope, element, attrs );
    _invokeLink = linkMocks.link;
    _destroyLink = linkMocks.destroy;

  } );

  it( 'should add required component/directive do _ddo.require via @Host,@Parent,@Optional with @Component', ()=> {

    @Component( {
      selector: 'foo',
      template: `hello`
    } )
    class FooComponent implements AfterContentInit{

      static wasCalled: boolean;
      static instance: FooComponent;
      static ctrlsFromArgs: any[];

      constructor(
        @Inject( 'hello' ) hello,
        @Host() @Inject( 'ngModel' ) public ngModel: ng.INgModelController,
        @Parent() @Inject( 'parentDirective' ) public parentDirective,
        @Optional() @Host() @Inject( 'hostDirective' ) public hostDirective?: Object,
        @Optional() @Parent() @Inject( 'optParentDirective' ) public optParentDirective?: Object
      ) {}

      ngAfterContentInit( controllers?: any[] ) {
        //console.log( 'ngAfterContentInit:',controllers );

        FooComponent.wasCalled = true;
        FooComponent.instance = this;
        FooComponent.ctrlsFromArgs = controllers;

      }
    }

    expect( FooComponent[ REQUIRE_METADATA_KEY ] )
      .to
      .deep
      .equal( [
        { id: 1, opt: false, parent: false, name: 'ngModel' },
        { id: 2, opt: false, parent: true, name: 'parentDirective' },
        { id: 3, opt: true, parent: false, name: 'hostDirective' },
        { id: 4, opt: true, parent: true, name: 'optParentDirective' }
      ] );
    expect( FooComponent.$inject ).to.deep.equal( [ 'hello' ] );
    expect( FooComponent[ DDO_METADATA_KEY ].require ).to.deep.equal( [
      'foo',
      'ngModel',
      '^parentDirective',
      '?hostDirective',
      '?^optParentDirective'
    ] );


    class NgModel{}
    class ParentDirective{}
    class HostDirective{}
    class OptParentDirective{}

    const _ddo: ng.IDirective = FooComponent[ '_ddo' ];
    const postLink = _ddo.link;

    _invokeLink(
      [ FooComponent, NgModel, ParentDirective, HostDirective, OptParentDirective ],
      postLink
    );

    expect( FooComponent.wasCalled ).to.equal( true );

    //console.log( 'instance:',FooComponent.instance );
    //console.log( 'ctrlsFromArgs:', FooComponent.ctrlsFromArgs );
    expect( FooComponent.ctrlsFromArgs ).to.deep.equal( [
      FooComponent.instance.ngModel,
      FooComponent.instance.parentDirective,
      FooComponent.instance.hostDirective,
      FooComponent.instance.optParentDirective
    ] );

  } );

  it( 'should add required component/directive do _ddo.require via @Host,@Parent,@Optional with @Directive', ()=> {

    @Directive( {
      selector: '[foo]'
    } )
    class FooDirective {
      constructor(
        @Inject( 'ola' ) ola,
        @Optional() @Parent() @Inject( 'optParentDirective' ) optParentDirective,
        @Parent() @Inject( 'parentDirective' ) parentDirective,
        @Optional() @Host() @Inject( 'hostDirective' ) hostDirective,
        @Host() @Inject( 'ngModel' ) ngModel: ng.INgModelController
      ) {}
    }

    expect( FooDirective[ REQUIRE_METADATA_KEY ] )
      .to
      .deep
      .equal( [
        { id: 1, opt: true, parent: true, name: 'optParentDirective' },
        { id: 2, opt: false, parent: true, name: 'parentDirective' },
        { id: 3, opt: true, parent: false, name: 'hostDirective' },
        { id: 4, opt: false, parent: false, name: 'ngModel' }
      ] );
    expect( FooDirective.$inject ).to.deep.equal( [ 'ola' ] );
    expect( FooDirective[ DDO_METADATA_KEY ].require ).to.deep.equal( [
      'foo',
      '?^optParentDirective',
      '^parentDirective',
      '?hostDirective',
      'ngModel'
    ] );


  } );

  it( 'should not care about decorator order for particular parameter', function () {



  } );


} );
