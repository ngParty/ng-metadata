import {expect} from 'chai';
import {Pipe} from "../../src/pipes/decorators";
import {PipeResolver} from "../../src/linker/pipe_resolver";
import {PipeMetadata} from "../../src/pipes/metadata";

describe( `linker/pipe_resolver`, ()=> {

  it( `should return Pipe metadata if exists on provided type`, ()=> {

    @Pipe({ name:'myPipeFoo' } )
    class MyPipe{}

    const resolver = new PipeResolver();
    const actual = resolver.resolve(MyPipe);
    const expected = true;

    expect(actual instanceof PipeMetadata).to.equal(expected);

  } );

  it( `should throw error when provided type doesnt have Pipe metadata`, ()=> {

    class NoPipe{}

    const resolver = new PipeResolver();

    expect(()=>resolver.resolve(NoPipe)).to.throw();

  } );

} );
