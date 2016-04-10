import { Type } from '../../facade/lang';

export type SetterFn = ( obj: any, value: any ) => void;
export type GetterFn = ( obj: any ) => any;
export type MethodFn = ( obj: any, args: any[] ) => any;
