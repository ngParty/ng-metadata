import {expect} from 'chai';
import {provide} from '../src/providers';

describe( 'provide', ()=> {

  it( 'should create service camelCased name from class name and augment its _name', function () {

    class MyHeroSvc{}

    expect( provide( MyHeroSvc ) ).to.equal( 'myHeroSvc' );
    expect( MyHeroSvc[ '_name' ] ).to.equal( 'myHeroSvc' )

  } );
  it( 'should create name alias from provided token and augment useClass Type._name', function () {

    class MyHeroSvc{}
    expect( MyHeroSvc[ '_name' ] ).to.equal( undefined );
    expect( provide( 'MyHero', { useClass: MyHeroSvc } ) ).to.equal( 'MyHero' );
    expect( MyHeroSvc[ '_name' ] ).to.equal( 'MyHero' );

  } );
  it( 'should use Type._name for registering provider if _name exists', function () {

    class MyHeroSvc {
      static _name = 'MyHero';
    }
    expect( provide( MyHeroSvc ) ).to.equal( 'MyHero' );
    expect( MyHeroSvc._name ).to.equal( 'MyHero' );

  } );
  it( 'should throw when using useClass for aliasing and token is not string', function () {

    class MyHeroSvc{}
    function willThrow(){
      provide( function foo(){}, { useClass: MyHeroSvc } )
    }

    expect( willThrow ).to.throw();

  } );
  it( 'should return Pipe registered name if the Type is Pipe', function () {

    class Pipe{
      static pipeName='hello';
    }
    expect(provide( Pipe )).to.equal('hello');

    class NoPipe{}
    // will execute default logic which is meant for service
    expect(provide( NoPipe )).to.equal('noPipe');

  } );
  it( 'should create camelCased name from selector property if Type is Directive/Component', function () {

    class MyDirective {
      static selector = '[my-foo]'
    }
    expect( provide( MyDirective ) ).to.equal( 'myFoo' );

    class MyCmp {
      static selector = 'my-boo'
    }
    expect( provide( MyCmp ) ).to.equal( 'myBoo' );


  } );

} );
