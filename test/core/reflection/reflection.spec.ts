import { expect } from 'chai';
import { makePropDecorator } from '../../../src/core/util/decorators';
import { Injectable, Inject, Host, SkipSelf } from '../../../src/core/di/decorators';
import { InjectableMetadata, SkipSelfMetadata, HostMetadata, InjectMetadata } from '../../../src/core/di/metadata';
import { assign } from '../../../src/facade/lang';
import { reflector } from '../../../src/core/reflection/reflection';
import { globalKeyRegistry } from '../../../src/core/di/key';
import { NgForm } from '../../../src/common/directives/ng_form';


describe( `reflection/reflector`, ()=> {

  beforeEach( ()=> {
    globalKeyRegistry._reset();
  } );

    it( `should extract class annotation if present`, ()=> {

      @Injectable()
      class Test{}

      const actual = reflector.annotations(Test);
      const expected = [new InjectableMetadata('test#1')];

      expect(actual).to.deep.equal(expected);

    } );
    it( `should extract class property metadata if present`, ()=> {

      class FooMetadata{
        toString(): string { return `@Foo()`; }
      }
      const Foo = makePropDecorator(FooMetadata);

      class Test{
        @Foo() jedi: string;

        constructor(){
          this.jedi = 'Obi-wan Kenobi';
        }
      }



      const actual = reflector.propMetadata(Test);
      const expected = { jedi: [ FooMetadata.prototype ] };

      expect(actual).to.deep.equal(expected);

    } );
    it ( `should respect parent property metadata`, () => {
      class FooMetadata{
        toString(): string { return `@Foo()`; }
      }
      const Foo = makePropDecorator(FooMetadata);
      class BarMetadata{
        toString(): string { return `@Bar()`; }
      }
      const Bar = makePropDecorator(BarMetadata);

      class Test{
        @Foo() jedi: string;

        constructor(){
          this.jedi = 'Obi-wan Kenobi';
        }
      }
      class TestA extends Test{
        @Bar() luke: string;

        constructor(){
          super();
          this.luke = 'Obi-wan Kenobi';
        }
      }
      const actual = reflector.propMetadata(TestA);
      const expected = { luke: [ BarMetadata.prototype ], jedi: [ FooMetadata.prototype ] };

      expect(actual).to.deep.equal(expected);
    });
    it( `should extract constructor params metadata if present`, ()=> {

      function _createProto( Type, props ) {
        const instance = Object.create(Type.prototype);
        return assign(instance,props);
      }
      class Test{
        constructor(
          @Inject('$http') private $http: ng.IHttpService,
          @Inject('$log') private $log: ng.ILogService,
          @Host() @Inject('ngModel') ngModel: ng.INgModelController,
          @SkipSelf() @Inject(NgForm) ngForm: NgForm
        ){}
      }

      const actual = reflector.rawParameters(Test);
      const expected = [
        [_createProto(InjectMetadata,{token:'$http'})],
        [_createProto(InjectMetadata,{token:'$log'})],
        [_createProto(InjectMetadata,{token:'ngModel'}),_createProto(HostMetadata,null)],
        [_createProto(InjectMetadata,{token:NgForm}),_createProto(SkipSelfMetadata,null)]
      ];

      expect(actual).to.deep.equal(expected);

    } );
    it ( `should not duplicate constructor param metadata from the parent constructor to the child if the child has it's own params`, ()=> {
      function _createProto( Type, props ) {
        const instance = Object.create(Type.prototype);
        return assign(instance,props);
      }

      abstract class AbstractConstructorComponent {
        private form: any;
        constructor (@Inject('form') @Host() form: any) {
          this.form = form;
        }
      }

      class AConstructorComponent extends AbstractConstructorComponent {
        private $http: any;
        constructor (@Inject('form') @Host() form: any,
                     @Inject('$http') $http: any) {
          super(form);
          this.$http = $http;
        }
      }

      class BConstructorComponent extends AbstractConstructorComponent {
        private app: any;
        constructor (@Inject('form') @Host() form: any,
                     @Inject('app') @Host() app: any) {
          super(form);
          this.app = app;
        }
      }

      class CConstructorComponent extends AbstractConstructorComponent { }

      class DConstructorComponent extends AbstractConstructorComponent {
        constructor () {
          super (null);
        }
      }

      class EConstructorComponent extends AbstractConstructorComponent {
        constructor (form: any) {
          super (form);
        }
      }

      class FConstructorComponent extends BConstructorComponent {
        constructor (@Inject('$http') $http: any,
                     @Inject('form') @Host() form: any) {
          super (form, $http);
        }
      }

      const actualA = reflector.parameters(AConstructorComponent);
      const expectedA = [
        [_createProto(HostMetadata, null), _createProto(InjectMetadata,{token:'form'})],
        [_createProto(InjectMetadata,{token:'$http'})]
      ];
      expect(actualA).to.deep.equal(expectedA);

      const actualB = reflector.parameters(BConstructorComponent);
      const expectedB = [
        [_createProto(HostMetadata, null), _createProto(InjectMetadata,{token:'form'})],
        [_createProto(HostMetadata, null), _createProto(InjectMetadata,{token:'app'})]
      ];
      expect(actualB).to.deep.equal(expectedB);

      const actualC = reflector.parameters(CConstructorComponent);
      const expectedC = [
        [_createProto(HostMetadata, null), _createProto(InjectMetadata,{token:'form'})]
      ];
      expect(actualC).to.deep.equal(expectedC);

      const actualD = reflector.parameters(DConstructorComponent);
      const expectedD = [
        [_createProto(HostMetadata, null), _createProto(InjectMetadata,{token:'form'})]
      ];
      expect(actualD).to.deep.equal(expectedD);

      const actualE = reflector.parameters(DConstructorComponent);
      const expectedE = [
        [_createProto(HostMetadata, null), _createProto(InjectMetadata,{token:'form'})]
      ];
      expect(actualE).to.deep.equal(expectedE);

      const actualF = reflector.parameters(FConstructorComponent);
      const expectedF = [
        [_createProto(InjectMetadata,{token:'$http'})],
        [_createProto(HostMetadata, null), _createProto(InjectMetadata,{token:'form'})]
      ];
      expect(actualF).to.deep.equal(expectedF);
    } );

} );
