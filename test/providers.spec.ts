import {expect} from 'chai';
import {provide} from '../src/providers';

describe( 'provide', ()=> {

  it( 'should create service camelCased name from class name', function () {

    class MyHeroSvc{}

    expect( provide( MyHeroSvc ) ).to.equal( 'myHeroSvc' );

  } );
  it( 'should create name from optional as argument', function () {

    class MyHeroSvc{}
    expect( provide( MyHeroSvc, { useAlias: 'MyHero' } ) ).to.equal( 'MyHero' );

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
