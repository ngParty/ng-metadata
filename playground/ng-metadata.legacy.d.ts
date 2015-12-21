declare module ngMetadata{

  type AppRoot = string | Element | Document;
  function bootstrap(ngModule: ng.IModule, {element, strictDi}?: {
    element?: AppRoot;
    strictDi?: boolean;
  }): void;

  function provide(Type: any, {useAlias}?: {
    useAlias?: string;
  }): string;
  function makeDirective(Type: any): ng.IDirectiveFactory;
  function makePipe(Type: any): ($injector: ng.auto.IInjectorService) => any;

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
declare module "ng-metadata/ng-metadata" {
  export = ngMetadata;
}
