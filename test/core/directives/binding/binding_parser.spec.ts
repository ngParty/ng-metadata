import { expect } from 'chai';
import { _parseBindings, _setupInputs } from '../../../../src/core/directives/binding/binding_parser';
import { _parseFields } from '../../../../src/core/directives/binding/binding_parser';

describe.only( `directives/binding/binding_parser`, () => {

  describe( `Binding parser`, () => {


    describe( '#_parseFields', () => {
      it( 'should process nulls', () => {
        expect( _parseFields( null ) ).to.deep.equal( [] );
      } );

      it( 'should process values', () => {

        const inputs = [
          ' name ',
          ' prop :  attr ',
          'oldOW: <',
          'oldOWA: <aliased'
        ];
        const actual = _parseFields( inputs );
        const expected = [
          {
            prop: 'name',
            attr: 'name',
            bracketAttr: '[name]',
            parenAttr: '(name)',
            bracketParenAttr: '[(name)]'
          },
          {
            prop: 'prop',
            attr: 'attr',
            bracketAttr: '[attr]',
            parenAttr: '(attr)',
            bracketParenAttr: '[(attr)]'
          },
          {
            prop: 'oldOW',
            attr: '<',
            bracketAttr: '[<]',
            parenAttr: '(<)',
            bracketParenAttr: '[(<)]'
          },
          {
            prop: 'oldOWA',
            attr: '<aliased',
            bracketAttr: '[<aliased]',
            parenAttr: '(<aliased)',
            bracketParenAttr: '[(<aliased)]'
          }
        ];

        expect( actual ).to.deep.equal( expected );
      } );
    } );

    describe( `#_setupInput`, () => {
      it( `should setup proper inputs`, () => {
        const $attrs = {} as ng.IAttributes;
        const parsedFields = _parseFields( [ 'name', 'prop : attr' ] );
        const actual = _setupInputs( parsedFields, $attrs );


      } );
    } );

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

        const actual = _parseBindings( { inputs, attrs, outputs } );
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
