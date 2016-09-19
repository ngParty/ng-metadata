import { makeDecorator, makePropDecorator, TypeDecorator } from '../util/decorators';
import { Type } from '../../facade/lang';
import { ContentChildrenMetadata, ContentChildMetadata, ViewChildrenMetadata, ViewChildMetadata } from './metadata_di';
import {
  ComponentMetadata,
  DirectiveMetadata,
  InputMetadata,
  AttrMetadata,
  OutputMetadata,
  HostBindingMetadata,
  HostListenerMetadata,
  LegacyDirectiveDefinition,
  NgModuleMetadataType,
  NgModuleMetadata
} from './metadata_directives';
import { ChangeDetectionStrategy } from '../change_detection/constants';


/**
 * Interface for the {@link DirectiveMetadata} decorator function.
 *
 * See {@link DirectiveMetadataFactory}.
 */
export interface DirectiveDecorator extends TypeDecorator {}

/**
 * Interface for the {@link ComponentMetadata} decorator function.
 *
 * See {@link ComponentMetadataFactory}.
 */
export interface ComponentDecorator extends DirectiveDecorator {}

/**
 * Interface for the {@link NgModuleMetadata} decorator function.
 *
 * See {@link NgModuleMetadataFactory}.
 *
 * @stable
 */
export interface NgModuleDecorator extends TypeDecorator {}

/**
 * {@link DirectiveMetadata} factory for creating annotations, decorators.
 *
 * ### Example as TypeScript Decorator
 *
 * ```
 * ```
 *
 */
export interface DirectiveMetadataFactory {
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
export interface ComponentMetadataFactory {
  (obj: {
    selector?: string,
    inputs?: string[],
    attrs?: string[],
    outputs?: string[],
    host?: {[key: string]: string},
    providers?: any[],
    exportAs?: string,
    moduleId?: string,
    queries?: {[key: string]: any},
    viewProviders?: any[],
    changeDetection?: ChangeDetectionStrategy,
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
    moduleId?: string,
    queries?: {[key: string]: any},
    viewProviders?: any[],
    changeDetection?: ChangeDetectionStrategy,
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
export interface ContentChildrenMetadataFactory {
  (selector: Type | string, {descendants}?: {descendants?: boolean}): any;
  new (selector: Type | string, {descendants}?: {descendants?: boolean}): ContentChildrenMetadata;
}

/**
 * Factory for {@link ContentChild}.
 */
export interface ContentChildMetadataFactory {
  (selector: Type | string): any;
  new (selector: Type | string): ContentChildMetadataFactory;
}

/**
 * Factory for {@link ViewChildren}.
 */
export interface ViewChildrenMetadataFactory {
  (selector: Type | string): any;
  new (selector: Type | string): ViewChildrenMetadata;
}

/**
 * Factory for {@link ViewChild}.
 */
export interface ViewChildMetadataFactory {
  (selector: Type | string): any;
  new (selector: Type | string): ViewChildMetadataFactory;
}

/**
 * {@link InputMetadata} factory for creating decorators.
 *
 * See {@link InputMetadata}.
 */
export interface InputMetadataFactory {
  (bindingPropertyName?: string): any;
  new (bindingPropertyName?: string): any;
}

/**
 * {@link AttrMetadata} factory for creating decorators.
 *
 * See {@link AttrMetadata}.
 * @deprecated will be removed in 2.0
 */
export interface AttrMetadataFactory {
  (bindingPropertyName?: string): any;
  new (bindingPropertyName?: string): any;
}

/**
 * {@link OutputMetadata} factory for creating decorators.
 *
 * See {@link OutputMetadata}.
 */
export interface OutputMetadataFactory {
  (bindingPropertyName?: string): any;
  new (bindingPropertyName?: string): any;
}

/**
 * {@link HostBindingMetadata} factory function.
 */
export interface HostBindingMetadataFactory {
  (hostPropertyName?: string): any;
  new (hostPropertyName?: string): any;
}

/**
 * {@link HostListenerMetadata} factory function.
 */
export interface HostListenerMetadataFactory {
  (eventName: string, args?: string[]): any;
  new (eventName: string, args?: string[]): any;
}

/**
 * {@link NgModuleMetadata} factory for creating annotations, decorators or DSL.
 *
 * @experimental
 */
export interface NgModuleMetadataFactory {
  (obj?: NgModuleMetadataType): NgModuleDecorator;
  new (obj?: NgModuleMetadataType): NgModuleMetadata;
}


export const Component: ComponentMetadataFactory = makeDecorator(ComponentMetadata) as ComponentMetadataFactory;

export const Directive: DirectiveMetadataFactory = makeDecorator(DirectiveMetadata) as DirectiveMetadataFactory;

export const ContentChildren: ContentChildrenMetadataFactory = makePropDecorator(ContentChildrenMetadata);

export const ContentChild: ContentChildMetadataFactory = makePropDecorator(ContentChildMetadata);

export const ViewChildren: ViewChildrenMetadataFactory = makePropDecorator(ViewChildrenMetadata);

export const ViewChild: ViewChildMetadataFactory = makePropDecorator(ViewChildMetadata);

export const Input: InputMetadataFactory = makePropDecorator(InputMetadata);

/**
 *
 * @type {any}
 * @deprecated use @Input('@') instead. Will be removed in 2.0
 */
export const Attr: AttrMetadataFactory = makePropDecorator(AttrMetadata);

export const Output: OutputMetadataFactory = makePropDecorator(OutputMetadata);

export const HostBinding: HostBindingMetadataFactory = makePropDecorator(HostBindingMetadata);

export const HostListener: HostListenerMetadataFactory = makePropDecorator(HostListenerMetadata);

/**
 * Declares an ng module.
 * @experimental
 * @Annotation
 */
export const NgModule: NgModuleMetadataFactory = makeDecorator(NgModuleMetadata) as NgModuleMetadataFactory;
