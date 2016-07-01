import { Type } from '../../facade/lang';
import { ReflectorReader } from './reflector_reader';
import { PlatformReflectionCapabilities } from './platform_reflection_capabilities';

/**
 * Reflective information about a symbol, including annotations, interfaces, and other metadata.
 */
export class ReflectionInfo {
  constructor(
    public annotations?: any[],
    public parameters?: any[][],
    public factory?: Function,
    public interfaces?: any[],
    public propMetadata?: {[key: string]: any[]
    }
  ) {}
}

/**
 * Provides access to reflection data about symbols. Used internally by Angular
 * to power dependency injection and compilation.
 */
export class Reflector extends ReflectorReader {

  /** @internal */
  // _injectableInfo = new Map<any, ReflectionInfo>();
  /** @internal */
  // _getters = new Map<string, GetterFn>();
  /** @internal */
  // _setters = new Map<string, SetterFn>();
  /** @internal */
  // _methods = new Map<string, MethodFn>();
  /** @internal */
  // _usedKeys: Set<any>;
  reflectionCapabilities: PlatformReflectionCapabilities;

  constructor( reflectionCapabilities: PlatformReflectionCapabilities ) {
    super();
    // this._usedKeys = null;
    this.reflectionCapabilities = reflectionCapabilities;
  }

  isReflectionEnabled(): boolean { return this.reflectionCapabilities.isReflectionEnabled(); }


  parameters( typeOrFunc: /*Type*/ any ): any[][] {
    // // get cached
    // if (this._injectableInfo.has(typeOrFunc)) {
    //   var res = this._getReflectionInfo(typeOrFunc).parameters;
    //   return isPresent(res) ? res : [];
    // } else {
    return this.reflectionCapabilities.parameters( typeOrFunc );
    // }
  }

  rawParameters( typeOrFunc: Type ): any[][] {
    return this.reflectionCapabilities.rawParameters( typeOrFunc );
  }

  registerParameters( parameters, typeOrFunc: Type ): void {
    this.reflectionCapabilities.registerParameters( parameters, typeOrFunc );
  }

  annotations( typeOrFunc: /*Type*/ any ): any[] {
    // // get cached
    // if (this._injectableInfo.has(typeOrFunc)) {
    //   var res = this._getReflectionInfo(typeOrFunc).annotations;
    //   return isPresent(res) ? res : [];
    // } else {
    return this.reflectionCapabilities.annotations( typeOrFunc );
    // }
  }

  ownAnnotations( typeOrFunc: Type ): any[] {
    return this.reflectionCapabilities.ownAnnotations( typeOrFunc );
  }

  registerAnnotations( parameters, typeOrFunc: Type ): void {
    this.reflectionCapabilities.registerAnnotations( parameters, typeOrFunc );
  }

  propMetadata( typeOrFunc: /*Type*/ any ): {[key: string]: any[]} {
    // // get cached
    // if (this._injectableInfo.has(typeOrFunc)) {
    //   var res = this._getReflectionInfo(typeOrFunc).propMetadata;
    //   return isPresent(res) ? res : {};
    // } else {
    return this.reflectionCapabilities.propMetadata( typeOrFunc );
    // }
  }

  ownPropMetadata( typeOrFunc: Type ): {[key: string]: any[]} {
    return this.reflectionCapabilities.ownPropMetadata( typeOrFunc );
  }

  registerPropMetadata( parameters, typeOrFunc: Type ): void {
    this.reflectionCapabilities.registerPropMetadata( parameters, typeOrFunc );
  }

  registerDowngradedNg2ComponentName( componentName: string, typeOrFunc: Type ): void {
    this.reflectionCapabilities.registerDowngradedNg2ComponentName( componentName, typeOrFunc );
  }

  downgradedNg2ComponentName( typeOrFunc: Type ): string {
    return this.reflectionCapabilities.downgradedNg2ComponentName( typeOrFunc );
  }

  /** @internal */
  _getReflectionInfo( typeOrFunc: any )/*: ReflectionInfo */ {
    /*if (isPresent(this._usedKeys)) {
     this._usedKeys.add(typeOrFunc);
     }
     return this._injectableInfo.get(typeOrFunc);*/
  }

  /** @internal */
  _containsReflectionInfo( typeOrFunc: any ) { /*return this._injectableInfo.has(typeOrFunc);*/ }

}
