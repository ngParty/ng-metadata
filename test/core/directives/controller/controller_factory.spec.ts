import { expect } from 'chai';
import * as sinon from 'sinon';

import { ElementFactory, $Scope, $Attrs, getNg1InjectorMock } from '../../../utils';
import { DirectiveMetadata } from '../../../../src/core/directives/metadata_directives';
import { NgmDirective } from '../../../../src/core/directives/constants';
import {
  directiveControllerFactory,
  getRequiredControllers, createNewInjectablesToMatchLocalDi, getEmptyRequiredControllers
} from '../../../../src/core/directives/controller/controller_factory';
import { isFunction } from '../../../../src/facade/lang';

describe( `directives/controller/controller_factory`, () => {

  describe( `#directiveControllerFactory`, ()=> {

    let $element;
    let $scope;
    let $attrs;
    let $transclude = function $transclude(){};
    let locals;
    let $injector: ng.auto.IInjectorService;
    let jqParentStub;
    let jqDataStub;
    let jqInheritedDataStub;
    let metadata;

    class NgModel{}
    class Form{}

    beforeEach( ()=> {

      $element = ElementFactory();
      $scope = new $Scope();
      $attrs = new $Attrs();
      locals = {$scope,$element,$attrs,$transclude};
      metadata = new DirectiveMetadata( {
        selector: '[my-dir]',
        inputs: [ 'bindingOne: =' ],
        outputs: [ 'cbOne' ],
        attrs: [ 'attrOne: @' ]
      } );
      $injector = getNg1InjectorMock();
      jqParentStub = sinon.stub($element,'parent');
      jqDataStub = sinon.stub($element,'data');
      jqInheritedDataStub = sinon.stub($element,'inheritedData');

    } );

    afterEach( ()=> {

      jqParentStub.restore();
      jqDataStub.restore();
      jqInheritedDataStub.restore();

    } );

    it( `should instantiate component controller`, ()=> {

      function onChange(){}

      // now caller is always empty object because we are creating bindings manually
      const caller = {};
      class Controller{
        static $inject = [];
        constructor(){}
        ngOnInit(){}
        someInput = 123;
        someOutput = onChange;
      }
      const requireMap = {} as StringMap;
      const _ddo: NgmDirective = {};

      const actual = directiveControllerFactory(
        caller as any,
        Controller,
        $injector,
        locals,
        requireMap,
        _ddo,
        metadata
      );

      expect( Object.getPrototypeOf( actual ).constructor ).to.equal( Controller );
      expect( isFunction( actual.ngOnInit ) ).to.equal( true );
      expect( actual.someInput ).to.equal( 123 );
      expect( actual.someOutput ).to.equal( onChange );

    } );

    it( `should instantiate controller and assign required directives as undefined with proper other locals(services) during ctrl instantiation`,
      ()=> {

        jqParentStub.returns($element);
        jqDataStub.withArgs('$ngModelController').returns(new NgModel());
        jqInheritedDataStub.withArgs('$formController').returns(new Form());
        const mySvc = { hello(){} };

        class Controller{
          static $inject = ['ngModel','form','mySvc'];
          constructor(private ngModel,private form, private mySvc){}
          ngOnInit(){}
        }
        const caller = {};
        const requireMap = {
          'ngModel#1':'?ngModel',
          'form#2':'^^form'
        } as StringMap;
        const _ddo: NgmDirective = {};

        locals.mySvc = mySvc;

        const actual = directiveControllerFactory(
          caller as any,
          Controller,
          $injector,
          locals,
          requireMap,
          _ddo,
          metadata
        );

        expect( actual.ngModel ).to.deep.equal( undefined );
        expect( actual.form ).to.deep.equal( undefined );
        expect( actual.mySvc ).to.equal( mySvc );

      } );
    it( `should create _ngOnInitBound on ddo which will be called from preLink during controller instantiation`, ()=> {

      const caller = {};
      class Controller{
        static $inject = [];
        constructor(){}
        ngOnInit(){}
      }
      const requireMap = {} as StringMap;
      const _ddo: NgmDirective = {};

      const spy = sinon.spy( Controller.prototype, 'ngOnInit' );

      expect( spy.called ).to.equal( false );

      const actual = directiveControllerFactory(
        caller as any,
        Controller,
        $injector,
        locals,
        requireMap,
        _ddo,
        metadata
      );

      expect( spy.called ).to.equal( false );

      expect( isFunction( _ddo._ngOnInitBound ) ).to.equal( true );

    } );

    it( `should initialize required directives from withing _ngOnInitBound function and call ngOnInit if defined`,
      ()=> {

        jqParentStub.returns($element);
        jqDataStub.withArgs('$ngModelController').returns(new NgModel());
        jqInheritedDataStub.withArgs('$formController').returns(new Form());
        const mySvc = { hello(){} };

        class Controller{
          static $inject = ['ngModel','form','mySvc'];
          constructor(private ngModel,private form, private mySvc){}
          ngOnInit(){}
        }
        const caller = {};
        const requireMap = {
          'ngModel#1':'?ngModel',
          'form#3':'^^form'
        } as StringMap;
        const _ddo: NgmDirective = {};

        locals.mySvc = mySvc;

        const spy = sinon.spy( Controller.prototype, 'ngOnInit' );

        const actual = directiveControllerFactory(
          caller as any,
          Controller,
          $injector,
          locals,
          requireMap,
          _ddo,
          metadata
        );

        expect( spy.called ).to.equal( false );
        expect( actual.ngModel ).to.deep.equal( undefined );
        expect( actual.form ).to.deep.equal( undefined );
        expect( actual.mySvc ).to.equal( mySvc );

        _ddo._ngOnInitBound();

        expect( spy.called ).to.equal( true );
        expect( actual.ngModel ).to.deep.equal( new NgModel() );
        expect( actual.form ).to.deep.equal( new Form() );
        expect( actual.mySvc ).to.equal( mySvc );

      } );

    it( `should not call $injector.invoke again from _ngOnInitBound if no directives are required`, ()=> {

      const mySvc = { hello(){} };

      class Controller{
        static $inject = ['mySvc'];
        constructor(private mySvc){}
        ngOnInit(){}
      }
      const caller = {};
      const requireMap: StringMap = {};
      const _ddo: NgmDirective = {};

      locals.mySvc = mySvc;

      const spy = sinon.spy( $injector, 'invoke' );

      const actual = directiveControllerFactory(
        caller as any,
        Controller,
        $injector,
        locals,
        requireMap,
        _ddo,
        metadata
      );

      expect( spy.calledOnce ).to.equal( true );

      _ddo._ngOnInitBound();

      expect( spy.calledOnce ).to.equal( true );

    } );

  } );

  describe( `#getRequiredControllers`, ()=> {

    class NgModel{}
    class Form{}
    class MyDir{}
    class MyOpt{}

    let requiredMap: {ngModel: string; form: string; myDir: string; myOpt: string};
    let $element;
    let jqParentStub;
    let jqDataStub;
    let jqInheritedDataStub;

    beforeEach( ()=> {

      requiredMap = {
        ngModel: 'ngModel',
        form: '^^form',
        myDir: '^myDir',
        myOpt: '?^myOpt'
      };
      $element = ElementFactory();

      jqParentStub = sinon.stub($element,'parent');
      jqDataStub = sinon.stub($element,'data');
      jqInheritedDataStub = sinon.stub($element,'inheritedData');

    } );

    afterEach( ()=> {

      jqParentStub.restore();
      jqDataStub.restore();
      jqInheritedDataStub.restore();

    } );

    it( `should get required controllers instance as a Map`, ()=> {

      jqParentStub.returns($element);
      jqDataStub.withArgs('$ngModelController').returns(new NgModel());
      jqInheritedDataStub.withArgs('$formController').returns(new Form());
      jqInheritedDataStub.withArgs('$myDirController').returns(new MyDir());
      jqInheritedDataStub.withArgs('$myOptController').returns(null);

      class MyComponent{}
      const actual = getRequiredControllers( requiredMap, $element as any, MyComponent );
      const expected = {
        ngModel: new NgModel(),
        form: new Form(),
        myDir: new MyDir(),
        myOpt: null
      };

      expect( actual ).to.deep.equal( expected );

    } );

  } );

  describe( `#createNewInjectablesToMatchLocalDi`, () => {

    it( `should return new injectables array even if no changes`, () => {

      const injectables = [ 'one', 'twoSvc', 'three' ];
      const requireMap = {} as StringMap;
      const actual = createNewInjectablesToMatchLocalDi( injectables, requireMap );

      expect( actual ).to.deep.equal( injectables );
      expect( actual ).to.not.equal( injectables );

    } );

    it( `should correctly map injectables to hashed requires`, () => {

      const injectables = [ 'one', 'twoSvc', 'three' ];
      const requireMap = {
        'one#1': 'one',
        'three#3': '^three'
      } as StringMap;
      const actual = createNewInjectablesToMatchLocalDi( injectables, requireMap );
      const expected = [ 'one#1', 'twoSvc', 'three#3' ];
      expect( actual ).to.deep.equal( expected );

    } );

    it( `should correctly map injectables to hashed requires when there are multiple same local injectables`, () => {

      const injectables = [ 'one', 'twoSvc','one', 'three' ];
      const requireMap = {
        'one#1': 'one',
        'one#3': '^^one',
        'three#4': 'three',
      } as StringMap;
      const actual = createNewInjectablesToMatchLocalDi( injectables, requireMap );
      const expected = [ 'one#1', 'twoSvc','one#3', 'three#4' ];
      expect( actual ).to.deep.equal( expected );

    } );

  } );

  describe( `#getEmptyRequiredControllers`, ()=> {

    it( `should return original map with undefined values`, ()=> {

      const requireMap = {
        ngModel:'ngModel',
        form:'^^form',
        myValidator:'?myValidator'
      } as StringMap;
      const actual = getEmptyRequiredControllers(requireMap);
      const expected = {
        ngModel:undefined,
        form:undefined,
        myValidator:undefined
      };

      expect( actual ).to.deep.equal( expected );

    } );

  } );


} );
