import {expect} from 'chai';
import {makePropDecorator} from '../../../src/core/util/decorators';
import {Injectable} from '../../../src/core/di/decorators';
import {Inject} from '../../../src/core/di/decorators';
import {InjectableMetadata} from '../../../src/core/di/metadata';
import {Host} from '../../../src/core/di/decorators';
import {HostMetadata} from '../../../src/core/di/metadata';
import {assign} from '../../../src/facade/lang';
import {InjectMetadata} from '../../../src/core/di/metadata';
import {reflector} from '../../../src/core/reflection/reflection';
import {globalKeyRegistry} from '../../../src/core/di/key';


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
    it( `should extract constructor params metadata if present`, ()=> {

      function _createProto( Type, props ) {
        const instance = Object.create(Type.prototype);
        return assign(instance,props);
      }
      class Test{
        constructor(
          @Inject('$http') private $http: ng.IHttpService,
          @Inject('$log') private $log: ng.ILogService,
          @Host() @Inject('ngModel') ngModel: ng.INgModelController
        ){}
      }

      const actual = reflector.parameters(Test);
      const expected = [
        [_createProto(InjectMetadata,{token:'$http'})],
        [_createProto(InjectMetadata,{token:'$log'})],
        [_createProto(InjectMetadata,{token:'ngModel'}),_createProto(HostMetadata,null)]
      ];

      expect(actual).to.deep.equal(expected);

    } );

} );
