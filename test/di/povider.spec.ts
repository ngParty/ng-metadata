import {expect} from 'chai';
import {provide,provideResolver, _getInjectStringTokens} from "../../src/di/provider";
import {Inject,Injectable} from "../../src/di/decorators";
import {InjectMetadata,OptionalMetadata,HostMetadata} from "../../src/di/metadata";
import {Component,Directive} from "../../src/directives/decorators";
import {Pipe} from '../../src/pipes/decorators'

describe( `di/provider`, ()=> {

  describe( `public #provide`, ()=> {

    it( `should return string name and Ctor for Angular registry and add $inject prop if needed (string)`, ()=> {

      class Foo{
        constructor(@Inject('$http') private $http){

        }
      }
      const actual = provide('fooToken',{useClass:Foo});
      const expected = [ 'fooToken', Foo ];

      expect(actual).to.deep.equal(expected);
      expect(Foo.$inject).to.deep.equal(['$http']);

    } );
    it( `should return string name and Ctor for Angular registry and add $inject prop if needed (Class)`, ()=> {

      class MyService{}

      class Foo{
        constructor(@Inject(MyService) private mySvc){}
      }
      const actual = provide(Foo);
      const expected = ['foo', Foo];

      expect(actual).to.equal(expected);
      expect(Foo.$inject).to.deep.equal(['myService']);

    } );
    it( `should return string name and filter factory for Angular registry and add $inject prop if needed (Pipe)`, ()=> {

      class MyService{}

      @Pipe({
        name: 'fooYo'
      })
      class FooPipe{
        constructor(@Inject(MyService) private mySvc){}
      }
      const actual = provide(FooPipe);
      const expected = ['fooYo',function pipeFactory(){ return function pipe(){}}];

      expect(actual).to.equal(expected);
      expect(FooPipe.$inject).to.deep.equal(['myService']);

    } );
    it( `should return string name and directiveFactory for Angular registry and add $inject prop if needed (Directive)`, ()=> {

      class MyService{}

      @Directive({
        selector: '[my-foo]'
      })
      class FooDirective{
        constructor(@Inject(MyService) private mySvc){}
      }
      const actual = provide(FooDirective);
      const expected = ['myFoo',function directiveFactory(){return {}}];

      expect(actual).to.equal(expected);
      expect(FooDirective.$inject).to.deep.equal(['myService']);

    } );
    it( `should return string name and directiveFactory for Angular registry and add $inject prop if needed (Component)`, ()=> {

      class MyService{}

      @Component({
        selector: 'my-foo',
        template:`hello`
      })
      class FooComponent{
        constructor(@Inject(MyService) private mySvc,@Inject('$element') private $element){}
      }
      const actual = provide(FooComponent);
      const expected = ['myFoo',function directiveFactory(){return {}}];

      expect(actual).to.equal(expected);
      expect(FooComponent.$inject).to.deep.equal(['myService','$element']);

    } );

    // @TODO
    it.skip( `should work as factory with angular.module.*.apply and output array [injectName,typeFunction]`, ()=> {

      /*class MyService{}

      class Foo{
        constructor(@Inject(MyService) private mySvc){}
      }
      let actual = provide(Foo);
      let expected = [ 'foo', Foo ];

      expect(actual).to.deep.equal(expected);
      expect(Foo.$inject).to.deep.equal(['myService']);


      @Directive( {
        selector: '[my-attr]'
      } )
      class FooDirective{}

      let directiveProvider = provide(FooDirective) as [string,Function];
      actual = [ directiveProvider[ 0 ], directiveProvider[ 1 ]() ];
      expected = [ 'myAttr', {
        controller: FooDirective,
        link: function _postLink(){}
      } ];

      expect(actual).to.deep.equal(expected);
      expect(FooDirective.$inject).to.deep.equal(['myService']);*/

    } );

  } );

  describe( `#_getInjectStringTokens`, ()=> {

    it( `should create proper $inject string array`, ()=> {

      class MyService{}

      @Injectable()
      class AnotherService {
      }

      const parameters = [
        [new InjectMetadata('foo')],
        [new InjectMetadata(MyService)],
        [new InjectMetadata('boo')],
        [new InjectMetadata(AnotherService)],
        [new InjectMetadata('nope'),new OptionalMetadata(), new HostMetadata()]
      ];

      const actual = _getInjectStringTokens(parameters);
      const expected = ['foo','myService','boo','anotherService'];

      expect( actual ).to.deep.equal( expected );

    } );

  } );

  describe( `#provideResolver`, ()=> {

    it( `should get DI container string name if string`, ()=> {

      const actual = provideResolver( '$http' );
      const expected = '$http';

      expect( actual ).to.equal( expected );

    } );

    it( `should get DI container string name if service Class`, ()=> {

      class MyService{}

      const actual = provideResolver( MyService );
      const expected = 'myService';

      expect( actual ).to.equal( expected );

    } );
    it( `should get DI container string name if Injectable Class`, ()=> {

      @Injectable()
      class MyService{}

      const actual = provideResolver( MyService );
      const expected = 'myService';

      expect( actual ).to.equal( expected );

    } );
    it( `should get DI container string name if Directive Class`, ()=> {

      @Directive({
        selector:'[my-attr]'
      })
      class MyDirective{}

      const actual = provideResolver( MyDirective );
      const expected = 'myAttr';

      expect( actual ).to.equal( expected );


    } );
    it( `should get DI container string name if Component Class`, ()=> {

      @Component({
        selector:'my-cmp'
      })
      class MyComponent{}

      const actual = provideResolver( MyComponent );
      const expected = 'myCmp';

      expect( actual ).to.equal( expected );

    } );
    it( `should get DI container string name if Pipe Class`, ()=> {

      @Pipe({
        name:'myPipeYo'
      })
      class MyPipe{}

      const actual = provideResolver( MyPipe );
      const expected = 'myPipeYo';

      expect( actual ).to.equal( expected );

    } );


  } );

} );
