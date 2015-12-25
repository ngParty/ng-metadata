import { expect } from 'chai';
import { Injectable, INJECTABLE_NAME_TOKEN } from '../src/di/injectable';

describe( '@Injectable', ()=> {

  it( 'should decorate class with _name property which should be extracted from class name or function', function () {

    @Injectable()
    class HelloSvc {}

    const actual = HelloSvc[ INJECTABLE_NAME_TOKEN ];
    const expected = 'helloSvc';

    expect( actual ).to.equal( expected );

  } );

  it( 'should favour provided name argument for _name if provided', function () {

    @Injectable( 'darkSvc' )
    class HelloSvc {}

    const actual = HelloSvc[ INJECTABLE_NAME_TOKEN ];
    const expected = 'darkSvc';

    expect( actual ).to.equal( expected );

  } );

} );

