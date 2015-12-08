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

  interface OnInit {
    onInit(args?: any): any;
  }
  interface OnDestroy {
    onDestroy(args?: any): any;
  }
  interface AfterContentInit {
    afterContentInit(args?: any[]): any;
  }

}
declare module "ng-metadata/ng-metadata" {
  export = ngMetadata;
}
