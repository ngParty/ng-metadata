import { expect } from 'chai';
import { _parseBindings, _setupInputs, _setupOutputs } from '../../../../src/core/directives/binding/binding_parser';
import { _parseFields } from '../../../../src/core/directives/binding/binding_parser';

describe( `directives/binding/binding_parser`, () => {

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
      it( `should return empty schema if no matches`, () => {

        const $attrs = {} as any;
        const parsedFields = _parseFields( [] );
        const actual = _setupInputs( parsedFields, $attrs );
        const expected = {
          inputs: {},
          attrs: {}
        };

        expect( actual ).to.deep.equal( expected );

      } );
      it( `should not process inputs if they are not defined within template`, () => {

        const $attrs = {
          '[foo]':'$ctrl.allo'
        } as any;
        const parsedFields = _parseFields( ['moo'] );
        const actual = _setupInputs( parsedFields, $attrs );
        const expected = {
          inputs: {},
          attrs: {}
        };

        expect( actual ).to.deep.equal( expected );

      } );
      it( `should setup proper inputs`, () => {
        const $attrs = {
          '[name]': '$ctrl.name',
          '[attr]': '$ctrl.someValue',
          '[(twoWay)]': '$ctrl.trouble',
          interpo: '{{ $ctrl.wat }}',
          oldOW: '$ctrl.someValueOld',
          oldOWInterpo: '{{ $ctrl.watOld }}',
          oldTwoWay: '$ctrl.troubleAgain',
          aliased: '$ctrl.someValueAliased'
        } as any;
        const inputFieldsToParse = [
          ' name ',
          ' prop :  attr ',
          'interpo',
          'twoWay',
          'oldTwoWay: =',
          'oldOWInterpo: @',
          'oldOW: <',
          'oldOWA: <aliased'
        ];
        const parsedFields = _parseFields( inputFieldsToParse );
        const actual = _setupInputs( parsedFields, $attrs );
        const expected = {
          inputs: {
            name: {
              mode: '<', exp: '$ctrl.name', attrName: '[name]', optional: true
            },
            prop: {
              mode: '<', exp: '$ctrl.someValue', attrName: '[attr]', optional: true
            },
            twoWay: {
              mode: '=', exp: '$ctrl.trouble', attrName: '[(twoWay)]', optional: true
            },
            oldTwoWay: {
              mode: '=', exp: '$ctrl.troubleAgain', attrName: 'oldTwoWay', optional: true
            },
            oldOW: {
              mode: '<', exp: '$ctrl.someValueOld', attrName: 'oldOW', optional: true
            },
            oldOWA: {
              mode: '<', exp: '$ctrl.someValueAliased', attrName: 'aliased', optional: true
            }
          },
          attrs: {
            interpo: {
              mode: '@', exp: '{{ $ctrl.wat }}', attrName: 'interpo', optional: true
            },
            oldOWInterpo: {
              mode: '@', exp: '{{ $ctrl.watOld }}', attrName: 'oldOWInterpo', optional: true
            }
          }
        };

        expect( actual ).to.deep.equal( expected );

      } );
    } );

    describe( `#_setupOutputs`, () => {
      it( `should return empty schema if no matches`, () => {

        const $attrs = {} as any;
        const parsedFields = _parseFields( [] );
        const actual = _setupOutputs( parsedFields, $attrs );
        const expected = {
          outputs: {}
        };

        expect( actual ).to.deep.equal( expected );

      } );

      it( `should not process outputs if they are not defined within template`, () => {

        const $attrs = {
          '(onFoo)':'$ctrl.onAllo()'
        } as any;
        const parsedFields = _parseFields( ['onMoo'] );
        const actual = _setupOutputs( parsedFields, $attrs );
        const expected = {
          outputs: {}
        };

        expect( actual ).to.deep.equal( expected );

      } );

      it( `should setup proper outputs`, () => {
        const $attrs = {
          '(onName)': '$ctrl.changeName()',
          '(onAliased)': '$ctrl.changeNameWhoopie()',
          onGreet: '$ctrl.greetMe()',
          aliasedOnGreet: '$ctrl.whoopie()'
        } as any;
        const outputFieldsToParse = [
          'onName',
          'onHello: onAliased',
          'onGreet',
          'aliased: aliasedOnGreet',
        ];
        const parsedFields = _parseFields( outputFieldsToParse );
        const actual = _setupOutputs( parsedFields, $attrs );
        const expected = {
          outputs:{
            onName: {
              mode: '&', exp: '$ctrl.changeName()', attrName: '(onName)', optional: true
            },
            onHello: {
              mode: '&', exp: '$ctrl.changeNameWhoopie()', attrName: '(onAliased)', optional: true
            },
            onGreet: {
              mode: '&', exp: '$ctrl.greetMe()', attrName: 'onGreet', optional: true
            },
            aliased: {
              mode: '&', exp: '$ctrl.whoopie()', attrName: 'aliasedOnGreet', optional: true
            }
          }
        };

        expect( actual ).to.deep.equal( expected );

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
