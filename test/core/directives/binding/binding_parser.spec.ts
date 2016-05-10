import { expect } from 'chai';
import { _parseBindings } from '../../../../src/core/directives/binding/binding_parser';

describe( `directives/binding/binding_parser`, () => {

  describe( `Binding parser`, () => {

    describe( `#_parseBindings`, () => {

      it( `should create bindings from inputs,attrs,outputs`, ()=> {

        const inputs = [
          'one: =',
          'two: =twoAlias',
          'oneOpt: =?oneOpt',
          'oneWay: <',
          'oneWayAlias: <oneWayAlas'
        ];
        const attrs = [
          'color: @',
          'brood: @broodAlias'
        ];
        const outputs = [
          'onFoo',
          'onMoo: onMooAlias'
        ];

        const actual = _parseBindings( {inputs, attrs, outputs} );
        const expected = {
          inputs: {
            one: { mode: '=', alias: '', optional: true },
            oneOpt: { mode: '=', alias: 'oneOpt', optional: true },
            two: { mode: '=', alias: 'twoAlias', optional: true },
            oneWay: { mode: '<', alias: '', optional: true },
            oneWayAlias: { mode: '<', alias: 'oneWayAlas', optional: true }
          },
          attrs: {
            color: { mode: '@', alias: '', optional: true },
            brood: { mode: '@', alias: 'broodAlias', optional: true },
          },
          outputs: {
            onFoo: { mode: '&', alias: '', optional: true },
            onMoo: { mode: '&', alias: 'onMooAlias', optional: true },
          }
        };

        expect( actual ).to.deep.equal( expected );

      } );

    } );

  } );

} );
