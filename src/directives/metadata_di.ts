import {CONST, Type, stringify, isPresent, isString} from '../facade/lang';

@CONST()
export class QueryMetadata {
  /**
   * whether we want to query only direct children (false) or all
   * children (true).
   */
  descendants: boolean;
  first: boolean;

  constructor(
    private _selector: Type | string,
    {descendants = false, first = false}: {descendants?: boolean, first?: boolean} = {}
  ) {
    this.descendants = descendants;
    this.first = first;
  }

  /**
   * always `false` to differentiate it with {@link ViewQueryMetadata}.
   */
  get isViewQuery(): boolean { return false; }

  /**
   * what this is querying for.
   */
  get selector() { return this._selector; }

  /**
   * whether this is querying for a variable binding or a directive.
   */
  get isVarBindingQuery(): boolean { return isString(this.selector); }

  /**
   * returns a list of variable bindings this is querying for.
   * Only applicable if this is a variable bindings query.
   */
  get varBindings(): string[] { return (this.selector as string).split(','); }

  toString(): string { return `@Query(${stringify(this.selector)})`; }
}

/**
 * Configures a content query.
 *
 * Content queries are set before the `ngAfterContentInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Directive({
 *   selector: 'someDir'
 * })
 * class SomeDir {
 *   @ContentChildren(ChildDirective) contentChildren: QueryList<ChildDirective>;
 *
 *   ngAfterContentInit() {
 *     // contentChildren is set
 *   }
 * }
 * ```
 */
@CONST()
export class ContentChildrenMetadata extends QueryMetadata {
  constructor(
    _selector: Type | string,
    {descendants = false}: {descendants?: boolean} = {}
  ) {
    super( _selector, { descendants: descendants } );
  }
}

/**
 * Configures a content query.
 *
 * Content queries are set before the `ngAfterContentInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Directive({
 *   selector: 'someDir'
 * })
 * class SomeDir {
 *   @ContentChild(ChildDirective) contentChild;
 *
 *   ngAfterContentInit() {
 *     // contentChild is set
 *   }
 * }
 * ```
 */
@CONST()
export class ContentChildMetadata extends QueryMetadata {
  constructor( _selector: Type | string ) {
    super( _selector, { descendants: true, first: true } );
  }
}

/**
 * Similar to {@link QueryMetadata}, but querying the component view, instead of
 * the content children.
 *
 * ### Example ([live demo](http://plnkr.co/edit/eNsFHDf7YjyM6IzKxM1j?p=preview))
 *
 * ```javascript
 * @Component({...})
 * @View({
 *   template: `
 *     <item> a </item>
 *     <item> b </item>
 *     <item> c </item>
 *   `
 * })
 * class MyComponent {
 *   shown: boolean;
 *
 *   constructor(private @Query(Item) items:QueryList<Item>) {
 *     items.onChange(() => console.log(items.length));
 *   }
 * }
 * ```
 *
 * Supports the same querying parameters as {@link QueryMetadata}, except
 * `descendants`. This always queries the whole view.
 *
 * As `shown` is flipped between true and false, items will contain zero of one
 * items.
 *
 * Specifies that a {@link QueryList} should be injected.
 *
 * The injected object is an iterable and observable live list.
 * See {@link QueryList} for more details.
 */
@CONST()
export class ViewQueryMetadata extends QueryMetadata {
  constructor(
    _selector: Type | string,
    {descendants = false, first = false}: {descendants?: boolean, first?: boolean} = {}
  ) {
    super( _selector, { descendants: descendants, first: first } );
  }

  /**
   * always `true` to differentiate it with {@link QueryMetadata}.
   */
  get isViewQuery() { return true; }
  toString(): string { return `@ViewQuery(${stringify(this.selector)})`; }
}

/**
 * Configures a view query.
 *
 * View queries are set before the `ngAfterViewInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'someDir',
 *   templateUrl: 'someTemplate',
 *   directives: [ItemDirective]
 * })
 * class SomeDir {
 *   @ViewChildren(ItemDirective) viewChildren: QueryList<ItemDirective>;
 *
 *   ngAfterViewInit() {
 *     // viewChildren is set
 *   }
 * }
 * ```
 */
@CONST()
export class ViewChildrenMetadata extends ViewQueryMetadata {
  constructor( _selector: Type | string ) {
    super( _selector, { descendants: true } );
  }
}

/**
 * Configures a view query.
 *
 * View queries are set before the `ngAfterViewInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'someDir',
 *   templateUrl: 'someTemplate',
 *   directives: [ItemDirective]
 * })
 * class SomeDir {
 *   @ViewChild(ItemDirective) viewChild:ItemDirective;
 *
 *   ngAfterViewInit() {
 *     // viewChild is set
 *   }
 * }
 * ```
 */
@CONST()
export class ViewChildMetadata extends ViewQueryMetadata {
  constructor(_selector: Type | string) { super(_selector, {descendants: true, first: true}); }
}
