import { expect } from 'chai';

import { _parseHost } from '../../../../src/core/directives/host/host_parser';

describe( `directives/host/host_parser`, () => {

  describe( `#_parseHost`, ()=> {

    it( `should parse host object and return separated map`, ()=> {

      const host = {
        'tabindex': '1',
        'role': 'button',
        '[class.disabled]': 'isDisabled',
        '[class.enabled]': 'isEnabled',
        '[attr.aria-label]': 'ariaLabel',
        '[readonly]': 'isReadonly',
        '(mousemove)': 'onMove($event.target)',
        '(mouseenter)': 'onMouseEnter($event.clientX,$event.clientY)',
        '(mouseleave)': 'onMouseLeave($event.clientX, $event.clientY)',
        '(mouseout)': 'onMoveOut()',
        '(document: click)': 'onDocumentClick()',
        '(window    : resize)': 'onWindowResize()',
        '(body:keydown)': 'onKeyDown()'
      } as any;
      const actual = _parseHost( host );
      const expected = {
        hostStatic: {
          'tabindex': '1',
          'role': 'button'
        },
        hostBindings: {
          classes: {
            'disabled': 'isDisabled',
            'enabled': 'isEnabled'
          },
          attributes: {
            'aria-label': 'ariaLabel'
          },
          properties: {
            'readonly': 'isReadonly'
          }
        },
        hostListeners: {
          'mousemove': [ 'onMove', '$event.target' ],
          'mouseenter': [ 'onMouseEnter', '$event.clientX', '$event.clientY' ],
          'mouseleave': [ 'onMouseLeave', '$event.clientX', '$event.clientY' ],
          'mouseout': [ 'onMoveOut' ],
          'document:click': [ 'onDocumentClick' ],
          'window:resize': [ 'onWindowResize' ],
          'body:keydown': [ 'onKeyDown' ]
        }
      };

      expect( actual ).to.deep.equal( expected );

    } );

  } );

} );
