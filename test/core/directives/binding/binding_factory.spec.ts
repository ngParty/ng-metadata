import { expect } from 'chai';
import * as sinon from 'sinon';

import { ElementFactory, $Scope, $Attrs, $Interpolate, $Parse } from '../../../utils';
import { DirectiveMetadata } from '../../../../src/core/directives/metadata_directives';
import { StringMapWrapper } from '../../../../src/facade/collections';
import { _createDirectiveBindings } from '../../../../src/core/directives/binding/binding_factory';
import { isFunction, isPresent } from '../../../../src/facade/lang';
import { EventEmitter } from '../../../../src/facade/async';

describe( `directives/binding/binding_factory`, () => {

  describe( `#_createDirectiveBindings`, ()=> {

    const sandbox = sinon.sandbox.create();
    let $element;
    let $scope;
    let $attrs;
    let ctrl;
    let services;
    let event = {
      target: {
        position: 123,
        x: 111,
        y: 3333
      },
      preventDefault: sandbox.spy()
    };

    beforeEach( ()=> {
      $element = ElementFactory();
      $scope = new $Scope();
      $attrs = new $Attrs();
      services = {
        $interpolate: new $Interpolate(),
        $parse: new $Parse(),
        $rootScope: new $Scope()
      };
      ctrl = {};
    } );

    afterEach( ()=> {

      event.preventDefault.reset();
      sandbox.restore();

    } );

    it( `should create array of scope.$watch disposable callbacks for @Input`, ()=> {

      const metadata = {
        inputs: [
          'foo: =',
          'one: =oneAlias',
          'interpolate: @'
        ]
      } as DirectiveMetadata;
      StringMapWrapper.assign( $attrs, {
        foo: '$ctrl.parentFoo',
        oneAlias: '$ctrl.parentOne',
        interpolate: 'hello string'
      } );
      const bindingDisposables = _createDirectiveBindings( false, $scope, $attrs, ctrl, metadata, services );
      const {watchers,observers} = bindingDisposables._watchers;

      expect( watchers.length ).to.equal( 2 );
      expect( observers.length ).to.equal( 1 );

      // test Inputs
      const [[firstExp,firstListener],[secondExp,secondListener]] = $scope.$$watchers;

      expect(isFunction(firstExp)).to.equal(true);
      expect( ctrl.foo ).to.equal( '$ctrl.parentFoo evaluated' );

      firstListener( 'hello' );
      expect( ctrl.foo ).to.equal( 'hello' );

      expect(isFunction(secondExp)).to.equal(true);
      expect( ctrl.one ).to.equal( '$ctrl.parentOne evaluated' );

      secondListener( 'hello one' );
      expect( ctrl.one ).to.equal( 'hello one' );


      // test Inputs('@') for attr binding
      const {interpolate:interpolateAttr,} = $attrs.$$observers;
      const [firstAttrListener] = interpolateAttr;

      expect(isPresent(interpolateAttr)).to.equal(true);
      expect( ctrl.interpolate ).to.equal( 'hello string' );

      firstAttrListener( 'hello' );
      expect( ctrl.interpolate ).to.equal( 'hello' );

    } );

    it( `should create array of attrs.$observe disposable callbacks for @Input('@')`, ()=> {

      const metadata = {
        inputs: [
          'foo: @',
          'one: @oneAlias'
        ]
      } as DirectiveMetadata;

      $attrs.foo = 'hello first';
      $attrs.oneAlias = 'hello one';

      const bindingDisposables = _createDirectiveBindings(false, $scope, $attrs, ctrl, metadata, services );
      const {watchers,observers} = bindingDisposables._watchers;

      expect( watchers.length ).to.equal( 0 );
      expect( observers.length ).to.equal( 2 );

      const {foo:fooAttr,oneAlias:oneAttr} = $attrs.$$observers;
      const [firstListener] = fooAttr;
      const [secondListener] = oneAttr;

      expect(isPresent(fooAttr)).to.equal(true);
      expect( ctrl.foo ).to.equal( 'hello first' );

      firstListener( 'hello' );
      expect( ctrl.foo ).to.equal( 'hello' );

      expect(isPresent(oneAttr)).to.equal(true);
      expect( ctrl.one ).to.equal( 'hello one' );

      secondListener( 'hello one after digest' );
      expect( ctrl.one ).to.equal( 'hello one after digest' );

    } );

    it( `should set to property EventEmitter instance which evaluates expression for @Output`, ()=> {

      const metadata = {
        outputs: [
          'onFoo',
          'onOne: onOneAlias'
        ]
      } as DirectiveMetadata;
      StringMapWrapper.assign( $attrs, {
        onFoo: '$ctrl.parentFoo()',
        onOneAlias: '$ctrl.parentOne()'
      } );
      const bindingDisposables = _createDirectiveBindings( false, $scope, $attrs, ctrl, metadata, services );
      const {watchers,observers} = bindingDisposables._watchers;

      expect( watchers.length ).to.equal( 0 );
      expect( observers.length ).to.equal( 0 );
      expect( Object.keys( ctrl ) ).to.deep.equal( [ 'onFoo', 'onOne' ] );
      expect( ctrl.onFoo ).to.be.an.instanceOf( EventEmitter );
      expect( ctrl.onOne ).to.be.an.instanceOf( EventEmitter );

      (ctrl.onFoo as EventEmitter<void>).subscribe( ( val )=> {
        expect( val ).to.equal( '$ctrl.parentFoo() evaluated' );
      } );
      (ctrl.onOne as EventEmitter<void>).subscribe( ( val )=> {
        expect( val ).to.equal( '$ctrl.parentOne() evaluated' );
      } );

      (ctrl.onFoo as EventEmitter<any>).emit( '$ctrl.parentFoo() evaluated' );
      (ctrl.onOne as EventEmitter<any>).emit( '$ctrl.parentOne() evaluated' );

    } );

  } );

} );
