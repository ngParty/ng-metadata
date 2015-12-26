import {expect} from 'chai';
import {extractAnnotation,extractParameter,extractProperty,makePropDecorator} from '../../src/util/decorators';
import {Injectable} from "../../src/di/decorators";
import {Inject} from "../../src/di/decorators";
import {InjectableMetadata} from "../../src/di/metadata";
import {Host} from "../../src/di/decorators";
import {HostMetadata} from "../../src/di/metadata";
import {assign} from "../../src/facade/lang";
import {InjectMetadata} from "../../src/di/metadata";

describe( `util/decorators`, ()=> {

  describe( `extraction helpers`, ()=> {

    it( `should extract class annotation if present`, ()=> {

      @Injectable()
      class Test{}

      const actual = extractAnnotation(Test);
      const expected = [InjectableMetadata.prototype];

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

      const actual = extractProperty(Test);
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

      const actual = extractParameter(Test);
      const expected = [
        [_createProto(InjectMetadata,{token:'$http'})],
        [_createProto(InjectMetadata,{token:'$log'})],
        [_createProto(InjectMetadata,{token:'ngModel'}),_createProto(HostMetadata,null)]
      ];

      expect(actual).to.deep.equal(expected);

    } );

  } );

} );
