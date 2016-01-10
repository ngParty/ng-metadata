import {expect} from 'chai';
import {getNg1InjectorMock} from '../../../src/testing/utils';
import {isString,isFunction} from '../../../src/facade/lang';
import {Pipe} from '../../../src/core/pipes/decorators';
import {pipeProvider} from '../../../src/core/pipes/pipe_provider';
import {PipeTransform} from '../../../src/core/pipes/pipe_interfaces';

  describe( `pipes/pipeProvider`, ()=> {

    const $injector = getNg1InjectorMock();

    it( `should create angular 1 filter factory`, ()=> {

      @Pipe( { name: 'uppercase' } )
      class UppercasePipe implements PipeTransform {
        transform( input: string ) { return input.toUpperCase() }
      }

      const [filterName,ngFilterFactory] = pipeProvider.createFromType( UppercasePipe );
      expect( isString( filterName ) ).to.equal( true );
      expect( filterName ).to.equal( 'uppercase' );
      expect( isFunction(ngFilterFactory) ).to.equal( true );

      const ngFilter = ngFilterFactory($injector);
      expect(ngFilter('foo')).to.equal('FOO');

    } );

    it( `should process filter options as rest array in #transform`, ()=> {

      @Pipe( { name: 'uppercase' } )
      class UppercasePipe implements PipeTransform {
        transform( input: string, ...args ) {
          if ( args ) {
            const [shouldReplace,withStr] = args;
            if ( shouldReplace ) {
              return withStr;
            }
          }
          return input.toUpperCase()
        }
      }

      const [,ngFilterFactory] = pipeProvider.createFromType( UppercasePipe );
      const ngFilter = ngFilterFactory($injector);

      expect(ngFilter('foo',true,'moo')).to.equal('moo');

    } );

    it( `should set $stateful to true on filter closure if pure is false `, ()=> {

      let value = {name:'foo'};

      @Pipe( { name: 'uppercase', pure:false } )
      class UppercasePipe implements PipeTransform {
        value = value;
        constructor(){}
        transform( input: string ) { return `${input.toUpperCase()}-${this.value.name}`}
      }

      const [,ngFilterFactory] = pipeProvider.createFromType( UppercasePipe );
      const ngFilter = ngFilterFactory($injector);

      expect( ngFilter.$stateful ).to.equal( true );
      expect(ngFilter('foo')).to.equal('FOO-foo');

    } );

    it( `should throw error when #transform method not implemented`, ()=> {

      @Pipe( { name: 'uppercase' } )
      class UppercasePipe{}

      expect(()=>pipeProvider.createFromType( UppercasePipe )).to.throw(`@Pipe: must implement '#transform' method`)

    } );

  } );

