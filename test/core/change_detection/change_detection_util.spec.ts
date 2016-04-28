import { expect } from 'chai';
import { ChangeDetectionStrategy } from '../../../src/core/change_detection/constants';
import { ChangeDetectionUtil } from '../../../src/core/change_detection/change_detection_util';
import { isDefaultChangeDetectionStrategy } from '../../../src/core/change_detection/constants';

describe( `change_detection_util`, () => {

  describe( `ChangeDetectionUtil`, () => {

    it( `should check if change detection is OnPush`, () => {

      let cd = ChangeDetectionStrategy.Default;
      let actual = ChangeDetectionUtil.isOnPushChangeDetectionStrategy( cd );
      let expected = false;

      expect( actual ).to.equal( expected );

      cd = ChangeDetectionStrategy.OnPush;
      actual = ChangeDetectionUtil.isOnPushChangeDetectionStrategy( cd );
      expected = true;

      expect( actual ).to.equal( expected );


    } );

    it( `should check if change detection is Default`, () => {

      let cd = ChangeDetectionStrategy.Default;
      let actual = isDefaultChangeDetectionStrategy( cd );
      let expected = true;

      expect( actual ).to.equal( expected );
      expect( isDefaultChangeDetectionStrategy( undefined ) ).to.equal( expected );

      cd = ChangeDetectionStrategy.OnPush;
      actual = isDefaultChangeDetectionStrategy( cd );
      expected = false;
      expect( actual ).to.equal( expected );

    } );

  } );

} );
