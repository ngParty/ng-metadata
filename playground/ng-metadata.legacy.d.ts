declare module ngMetadataPlatform{

  type AppRoot = string | Element | Document;
  function bootstrap(ngModule: ng.IModule, {element, strictDi}?: {
    element?: AppRoot;
    strictDi?: boolean;
  }): void;

}
declare module ngMetadataCore{

  export interface Type extends Function {}

  export class OpaqueToken {
    private _desc;
    constructor(_desc: string);
    desc: string;
    toString(): string;
  }

  export type ProviderType = Type | string | OpaqueToken;
  /**
   * should extract the string token from provided Type and add $inject angular 1 annotation to constructor if @Inject
   * was used
   * @param type
   * @returns {string}
   */
  export function provide(type: ProviderType, {useClass, useValue}?: {
    useClass?: Type;
    useValue?: any;
  }): [string, Type];

  function Directive({selector, legacy}: {
    selector: string;
    legacy?: ng.IDirective;
  }): ClassDecorator;
  function Component({selector, template, templateUrl, inputs, attrs, outputs, legacy}: {
    selector: string;
    template?: string;
    templateUrl?: string;
    inputs?: string[];
    outputs?: string[];
    attrs?: string[];
    legacy?: ng.IDirective;
  }): ClassDecorator;
  function Output(bindingPropertyName?: string): PropertyDecorator;
  function Input(bindingPropertyName?: string): PropertyDecorator;
  function Attr(bindingPropertyName?: string): PropertyDecorator;

  function Pipe({name, pure}?: {
    name?: string;
    pure?: boolean;
  }): ClassDecorator;

  export function Optional(): ParameterDecorator;
  export function Host(): ParameterDecorator;
  export function Parent(): ParameterDecorator;

  interface InjectableServiceConfigStatic {
    _name?: string
  }
  /**
   * Injectable type used for @Inject(Injectable) decorator
   */
  type InjectableToken = string | Function | InjectableServiceConfigStatic;

  function Inject(injectable: InjectableToken): ParameterDecorator;

  function Injectable(name?: string): ClassDecorator;

  /**
  * Lifecycle hooks are guaranteed to be called in the following order:
  * - `OnInit` (from directive preLink),
  * - `AfterContentInit` ( from directvie postLink -> all children are rendered and has scope resolved),
  * - `OnDestroy` (at the very end before destruction, on $scope.$on('$destroy'))
  */
  /**
  * Implement this interface to execute custom initialization logic after your directive's
  * data-bound properties have been initialized.
  *
  * `ngOnInit` is called right after the directive's data-bound properties have been checked for the
  * first time, and before any of its children have been checked.
  * It is invoked only once when the directive is instantiated.
  *
  * In angular 1 terms, this method is invoked from `preLink`
  * @TODO implement this @martin
  */
  export interface OnInit {
      ngOnInit(args?: any): any;
  }
  /**
  * Implement this interface to get notified when your directive's content and view has been fully
  * initialized.
  */
  export interface AfterContentInit {
      ngAfterContentInit(controllers?: any[]): any;
  }
  /**
  * Implement this interface to get notified when your directive is destroyed.
  *
  * `ngOnDestroy` callback is typically used for any custom cleanup that needs to occur when the
  * instance(directive) is destroyed
  */
  export interface OnDestroy {
      ngOnDestroy(args?: any): any;
  }

}
declare module "ng-metadata/core" {
  export = ngMetadataCore;
}
declare module "ng-metadata/platform" {
  export = ngMetadataPlatform;
}

declare type Type = Function;
declare type ProvideSpreadType = string|Type;

declare module angular {
  interface IModule {
    // constant(object: Object): IModule;
    // value(object: Object): IModule;
    directive(...args: ProvideSpreadType[]): IModule;
    filter(...args: ProvideSpreadType[]): IModule;
    service(...args: ProvideSpreadType[]): IModule;
  }
}
