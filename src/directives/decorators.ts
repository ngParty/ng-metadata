import {
  makeDecorator,
  makePropDecorator,
  TypeDecorator
} from '../util/decorators';

import {Type} from '../facade/lang';

import {
  ContentChildrenMetadata,
  ContentChildMetadata,
  ViewChildrenMetadata,
  ViewChildMetadata,
  ViewQueryMetadata
} from './metadata_di';

import {
  ComponentMetadata,
  DirectiveMetadata,
  InputMetadata,
  AttrMetadata,
  OutputMetadata,
  HostBindingMetadata,
  HostListenerMetadata
} from './metadata_directives';
import {LegacyDirectiveDefinition} from "./metadata_directives";


/**
 * Interface for the {@link DirectiveMetadata} decorator function.
 *
 * See {@link DirectiveFactory}.
 */
export interface DirectiveDecorator extends TypeDecorator {}

/**
 * Interface for the {@link ComponentMetadata} decorator function.
 *
 * See {@link ComponentFactory}.
 */
export interface ComponentDecorator extends DirectiveDecorator {}

/**
 * {@link DirectiveMetadata} factory for creating annotations, decorators.
 *
 * ### Example as TypeScript Decorator
 *
 * ```
 * ```
 *
 */
export interface DirectiveFactory {
  (obj: {
    selector?: string,
    inputs?: string[],
    attrs?: string[],
    outputs?: string[],
    host?: {[key: string]: string},
    providers?: any[],
    exportAs?: string,
    queries?: {[key: string]: any},
    legacy?: LegacyDirectiveDefinition
  }): DirectiveDecorator;
  new (obj: {
    selector?: string,
    inputs?: string[],
    attrs?: string[],
    outputs?: string[],
    host?: {[key: string]: string},
    providers?: any[],
    exportAs?: string,
    queries?: {[key: string]: any},
    legacy?: LegacyDirectiveDefinition
  }): DirectiveMetadata;
}

/**
 * {@link ComponentMetadata} factory for creating annotations, decorators or DSL.
 *
 * ### Example as TypeScript Decorator
 *
 * ```
 * ```
 *
 */
export interface ComponentFactory {
  (obj: {
    selector?: string,
    inputs?: string[],
    attrs?: string[],
    outputs?: string[],
    host?: {[key: string]: string},
    providers?: any[],
    exportAs?: string,
    queries?: {[key: string]: any},
    viewProviders?: any[],
    templateUrl?: string,
    template?: string,
    styleUrls?: string[],
    styles?: string[],
    directives?: Array<Type | any[]>,
    pipes?: Array<Type | any[]>,
    legacy?: LegacyDirectiveDefinition
  }): ComponentDecorator;
  new (obj: {
    selector?: string,
    inputs?: string[],
    attrs?: string[],
    outputs?: string[],
    host?: {[key: string]: string},
    providers?: any[],
    exportAs?: string,
    queries?: {[key: string]: any},
    viewProviders?: any[],
    templateUrl?: string,
    template?: string,
    styleUrls?: string[],
    styles?: string[],
    directives?: Array<Type | any[]>,
    pipes?: Array<Type | any[]>,
    legacy?: LegacyDirectiveDefinition
  }): ComponentMetadata;
}


/**
 * Factory for {@link ContentChildren}.
 */
export interface ContentChildrenFactory {
  (selector: Type | string, {descendants}?: {descendants?: boolean}): any;
  new (selector: Type | string, {descendants}?: {descendants?: boolean}): ContentChildrenMetadata;
}

/**
 * Factory for {@link ContentChild}.
 */
export interface ContentChildFactory {
  (selector: Type | string): any;
  new (selector: Type | string): ContentChildFactory;
}

/**
 * Factory for {@link ViewChildren}.
 */
export interface ViewChildrenFactory {
  (selector: Type | string): any;
  new (selector: Type | string): ViewChildrenMetadata;
}

/**
 * Factory for {@link ViewChild}.
 */
export interface ViewChildFactory {
  (selector: Type | string): any;
  new (selector: Type | string): ViewChildFactory;
}

/**
 * {@link InputMetadata} factory for creating decorators.
 *
 * See {@link InputMetadata}.
 */
export interface InputFactory {
  (bindingPropertyName?: string): any;
  new (bindingPropertyName?: string): any;
}

/**
 * {@link AttrMetadata} factory for creating decorators.
 *
 * See {@link AttrMetadata}.
 */
export interface AttrFactory {
  (bindingPropertyName?: string): any;
  new (bindingPropertyName?: string): any;
}

/**
 * {@link OutputMetadata} factory for creating decorators.
 *
 * See {@link OutputMetadata}.
 */
export interface OutputFactory {
  (bindingPropertyName?: string): any;
  new (bindingPropertyName?: string): any;
}

/**
 * {@link HostBindingMetadata} factory function.
 */
export interface HostBindingFactory {
  (hostPropertyName?: string): any;
  new (hostPropertyName?: string): any;
}

/**
 * {@link HostListenerMetadata} factory function.
 */
export interface HostListenerFactory {
  (eventName: string, args?: string[]): any;
  new (eventName: string, args?: string[]): any;
}


export const Component: ComponentFactory =
  makeDecorator(ComponentMetadata/*, (fn: any) => fn.View = View*/) as ComponentFactory;

export const Directive: DirectiveFactory = <DirectiveFactory>makeDecorator(DirectiveMetadata);

export const ContentChildren: ContentChildrenFactory = makePropDecorator(ContentChildrenMetadata);

export const ContentChild: ContentChildFactory = makePropDecorator(ContentChildMetadata);

export const ViewChildren: ViewChildrenFactory = makePropDecorator(ViewChildrenMetadata);

export const ViewChild: ViewChildFactory = makePropDecorator(ViewChildMetadata);

export const Input: InputFactory = makePropDecorator(InputMetadata);

export const Attr: AttrFactory = makePropDecorator(AttrMetadata);

export const Output: OutputFactory = makePropDecorator(OutputMetadata);

export const HostBinding: HostBindingFactory = makePropDecorator(HostBindingMetadata);

export const HostListener: HostListenerFactory = makePropDecorator(HostListenerMetadata);
