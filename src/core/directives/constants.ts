import {
  AfterContentInit,
  AfterViewInit,
  AfterContentChecked,
  AfterViewChecked,
  OnInit,
  OnDestroy,
  OnChanges,
  DoCheck,
  OnChildrenChanged
} from '../linker/directive_lifecycle_interfaces';

export interface DirectiveCtrl extends AfterContentInit, AfterContentChecked, AfterViewInit, AfterViewChecked, OnInit,
  OnDestroy, OnChanges, DoCheck,OnChildrenChanged {
  __readChildrenOrderScheduled?: boolean
  __readViewChildrenOrderScheduled?: boolean
  __readContentChildrenOrderScheduled?: boolean
}

export interface NgmDirective extends ng.IDirective {
  _ngOnInitBound?():void;
}
