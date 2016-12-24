import { Type } from '../../facade/type';
import { reflector } from '../../core/reflection/reflection';
import { resolveDirectiveNameFromSelector, isString } from '../../facade/lang';
import { StringMapWrapper } from '../../facade/collections';

export type ProvideNg2ComponentParams = {
  component:Type,
  downgradeFn:downgradeComponent
};
export type downgradeComponent = (info: {
    component: Type,
    inputs?: string[],
    outputs?: string[],
}) => any;


/**
 * Used to register an Angular 2 Component as a directive on an Angular 1 module,
 * where the directive name and bindings(inputs,outputs) are automatically created from the selector.
 *
 * @example
 * ```typescript
 * // app.module.ts
 * import * as angular from 'angular'
 * import { downgradeComponent } from '@angular/upgrade/static/';
 * import { downgradeNg2Component } from 'ng-metadata/upgrade';
 * import { provide } from 'ng-metadata/core';
 *
 * import { Ng2Component } from './components/ng2.component';
 *
 * export const AppModule = angular
 *  .module('myApp',[])
 *  .directive(...downgradeNg2Component({component:Ng2Component,downgradeFn:downgradeComponent}))
 * ```
 */
export function downgradeNg2Component({component,downgradeFn}: ProvideNg2ComponentParams): [string,Function] {
  const {name,factoryFn} = _downgradeComponent({component,downgradeFn});
  return [name,factoryFn]
}

/**
 * Used to register an Angular 2 Component by including it in the `declarations` array of an ng-metadata `@NgModule`,
 * where the directive name and bindings(inputs,outputs) are automatically created from the selector.
 *
 * @example
 * ```typescript
 * // app.module.ts
 * import { downgradeComponent } from '@angular/upgrade/static/';
 * import { provideNg2Component } from 'ng-metadata/upgrade';
 * import { NgModule } from 'ng-metadata/core';
 *
 * import { Ng2Component } from './components/ng2.component';
 *
 * @NgModule({
 *  declarations:[
 *    provideNg2Component({component:Ng2Component,downgradeFn:downgradeComponent})
 *  ]
 * })
 * export class AppModule {};
 * ```
 */
export function provideNg2Component({component,downgradeFn}: ProvideNg2ComponentParams): Function {
  const {name,factoryFn} = _downgradeComponent({component,downgradeFn});

  reflector.registerDowngradedNg2ComponentName(name, factoryFn);
  return factoryFn;
}

/**
 *
 * @private
 * @internal
 */
export function _downgradeComponent({component,downgradeFn}: ProvideNg2ComponentParams): {name:string, factoryFn:Function} {
  // process inputs,outputs
  const propAnnotations = reflector.propMetadata(component);
  const {inputs=[],outputs=[]} = _getOnlyInputOutputMetadata(propAnnotations) || {};

  // process @Component
  const annotations = reflector.annotations(component);
  const cmpAnnotation = annotations[0];
  const directiveName = resolveDirectiveNameFromSelector(cmpAnnotation.selector);

  const downgradedDirectiveFactory = downgradeFn(
    StringMapWrapper.assign(
      {},
      inputs.length ? {inputs: inputs} : {},
      outputs.length ? {outputs: outputs} : {},
      {component: component},
    )
  );
  return {
    name: directiveName,
    factoryFn: downgradedDirectiveFactory
  };
}

type Ng2InputOutputPropDecoratorFactory = [{
  bindingPropertyName?: string,
  toString(): string
}]
function _getOnlyInputOutputMetadata(metadata:{[propName:string]:Ng2InputOutputPropDecoratorFactory[]}){
    if(StringMapWrapper.isEmpty( metadata)){
      return;
    }
    const inputOutput = {
      inputs: [],
      outputs: []
    };
    StringMapWrapper.forEach(metadata, (metaItem: Ng2InputOutputPropDecoratorFactory, key: string) => {
        if(_isNg2InputPropDecoratorFactory(metaItem)){
          inputOutput.inputs.push(
            _createBindingFromNg2PropDecoratorFactory(key,metaItem[0].bindingPropertyName)
          );
          return;
        }
        if(_isNg2OutputPropDecoratorFactory(metaItem)){
          inputOutput.outputs.push(
            _createBindingFromNg2PropDecoratorFactory(key,metaItem[0].bindingPropertyName)
          );
          return;
        }
    });
    return inputOutput;
}
function _createBindingFromNg2PropDecoratorFactory(prop:string,attr?:string): string {
  return isString(attr) ? `${prop}: ${attr}` : `${prop}`;
}
function _isNg2InputPropDecoratorFactory(metadataValues:any[]): boolean{
  return _isNg2InputOutputPropDecoratorFactory(metadataValues,'@Input');
}
function _isNg2OutputPropDecoratorFactory(metadataValues:any[]): boolean{
  return _isNg2InputOutputPropDecoratorFactory(metadataValues,'@Output');
}
function _isNg2InputOutputPropDecoratorFactory(metadataValues:any[], type:'@Input'|'@Output'): boolean {
    return metadataValues.some((metaValue:any)=>{
      const decoratorType = metaValue.toString();
      return decoratorType === type;
    })
}
