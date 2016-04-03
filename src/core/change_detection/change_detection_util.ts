import { isPresent, isBlank } from '../../facade/lang';
/**
 * Represents a basic change from a previous to a new value.
 */
export class SimpleChange {
  constructor(public previousValue: any, public currentValue: any) {}

  /**
   * Check whether the new value is the first value assigned.
   */
  isFirstChange(): boolean { return this.previousValue === ChangeDetectionUtil.uninitialized; }
}

export class UninitializedValue {}

function _simpleChange(previousValue, currentValue): SimpleChange {
  return new SimpleChange(previousValue, currentValue);
}

function _uninitializedValue(){
  return new UninitializedValue();
}

/* tslint:disable:requireParameterType */
export class ChangeDetectionUtil {
  static uninitialized: UninitializedValue = _uninitializedValue();

  static simpleChange(previousValue: any, currentValue: any): SimpleChange {
    return _simpleChange(previousValue, currentValue);
  }

  static isValueBlank(value: any): boolean { return isBlank(value); }

  static s(value: any): string { return isPresent(value) ? `${value}` : ''; }
}
