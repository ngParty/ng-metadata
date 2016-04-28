import { ChangeDetectionStrategy } from './constants';
import { isPresent } from '../../facade/lang';

export class UninitializedValue {}
const uninitialized = new UninitializedValue();

/**
 * Represents a basic change from a previous to a new value.
 */
export class SimpleChange {
  constructor(public previousValue: any, public currentValue: any) {}

  /**
   * Check whether the new value is the first value assigned.
   */
  isFirstChange(): boolean { return this.previousValue === uninitialized }
}

export class ChangeDetectionUtil {
  static uninitialized: UninitializedValue = uninitialized;

  static simpleChange(previousValue: any, currentValue: any): SimpleChange {
    return new SimpleChange(previousValue, currentValue);
  }

  static isOnPushChangeDetectionStrategy(changeDetectionStrategy: ChangeDetectionStrategy): boolean{
      return isPresent( changeDetectionStrategy ) && changeDetectionStrategy === ChangeDetectionStrategy.OnPush;
  }

}
