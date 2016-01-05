import {expect} from 'chai';
import {stringify} from "../../src/facade/lang";
import {DirectiveMetadata,ComponentMetadata} from "../../src/directives/metadata_directives";
import {
  Directive,
  Component,
  Input,
  Output,
  HostBinding,
  HostListener,
  Attr
} from "../../src/directives/decorators";
import {DirectiveResolver} from "../../src/linker/directive_resolver";
import {Inject} from "../../src/di/decorators";
import {Host} from "../../src/di/decorators";
import {Self} from "../../src/di/decorators";
import {Optional} from "../../src/di/decorators";
import {InjectMetadata} from "../../src/di/metadata";
import {HostMetadata} from "../../src/di/metadata";
import {SelfMetadata} from "../../src/di/metadata";
import {OptionalMetadata} from "../../src/di/metadata";
import {SkipSelf} from "../../src/di/decorators";


describe( `linker/directive_resolver`, ()=> {

  describe( `#resolve`, ()=> {

    it( `should return Directive metadata if exists on provided type`, ()=> {

      @Directive( {
        selector: '[myAttr]'
      } )
      class MyDirective {
      }

      const resolver = new DirectiveResolver();
      const actual = resolver.resolve( MyDirective );
      const expected = true;

      expect( actual instanceof DirectiveMetadata ).to.equal( expected );

    } );

    it( `should return Component metadata if exists on provided type`, ()=> {

      @Component( {
        selector: 'myComp',
        template: 'hello world'
      } )
      class MyComponent {
      }

      const resolver = new DirectiveResolver();
      const actual = resolver.resolve( MyComponent );
      const expected = true;

      expect( actual instanceof ComponentMetadata ).to.equal( expected );

    } );


    it( `should throw error when provided type doesn't have Directive/Component metadata`, ()=> {

      class NoDirective {}

      const resolver = new DirectiveResolver();

      expect( ()=>resolver.resolve( NoDirective ) )
        .to
        .throw( `No Directive annotation found on ${stringify( NoDirective )}` );

    } );

    it( `should update Class Metadata object accordingly with provided property Annotations`, ()=> {

      @Directive( {
        selector: '[myClicker]'
      } )
      class MyClicker {

        @Input()
        one: string;
        @Input( 'outsideAlias' )
        inside: string;
        @Output()
        onOne: Function;
        @Output( 'onOutsideAlias' )
        onInside: Function;

        @HostBinding( 'class.disabled' )
        isDisabled: boolean;

        @HostListener( 'mousemove', [ '$event.target' ] )
        onMove() {}

      }

      const resolver = new DirectiveResolver();

      const actual = resolver.resolve( MyClicker );
      const expected = new DirectiveMetadata( {
        selector: '[myClicker]',
        inputs: [
          'one',
          'inside: outsideAlias'
        ],
        attrs: [],
        outputs: [
          'onOne',
          'onInside: onOutsideAlias'
        ],
        host: {
          '[class.disabled]': 'isDisabled',
          '(mousemove)': 'onMove($event.target)',
        },
        exportAs: undefined,
        queries: {},
        providers: undefined
      } );

      expect( actual ).to.deep.equal( expected );

    } );

    it( `should update merge Class Metadata object with provided property Annotations`, ()=> {

      @Component( {
        selector: 'jedi',
        template: '<div>The force is strong</div>',
        inputs: [ 'one' ],
        outputs: [ 'onOne' ],
        attrs: [ 'name: publicName' ],
        host: {
          '[class.enabled]': 'isEnabled',
          '(mouseout)': 'onMoveOut()'
        },
        legacy: {
          controllerAs: 'jedi'
        }
      } )
      class JediComponent {

        @Attr()
        id: string;
        @Attr( 'attrAlias' )
        noAlias: string;

        public one: string;
        @Input( 'outsideAlias' )
        inside: string;
        public onOne: Function;
        @Output( 'onOutsideAlias' )
        onInside: Function;

        @HostBinding( 'class.disabled' )
        isDisabled: boolean;

        private get isEnabled() { return true };

        @HostListener( 'mousemove', [ '$event.target' ] )
        onMove() {}

        onMoveOut() {}

      }

      const resolver = new DirectiveResolver();

      const actual = resolver.resolve( JediComponent );
      const expected = new ComponentMetadata( {
        selector: 'jedi',
        template: '<div>The force is strong</div>',
        inputs: [
          'one',
          'inside: outsideAlias'
        ],
        attrs: [
          'name: publicName',
          'id',
          'noAlias: attrAlias'
        ],
        outputs: [
          'onOne',
          'onInside: onOutsideAlias'
        ],
        host: {
          '[class.disabled]': 'isDisabled',
          '[class.enabled]': 'isEnabled',
          '(mousemove)': 'onMove($event.target)',
          '(mouseout)': 'onMoveOut()'
        },
        exportAs: undefined,
        queries: {},
        providers: undefined,
        legacy: {
          controllerAs: 'jedi'
        }
      } );

      expect( actual ).to.deep.equal( expected );

    } );

  } );

  describe( `#getDirectivesToInject`, ()=> {

    it( `should return require expression map from param metadata which are injecting directives`, ()=> {

      @Directive({selector:'[foo]'})
      class Foo{

        constructor(
          @Inject( '$log' ) private $log,
          @Inject( '$attrs' ) private $attrs,
          @Inject('clicker') @Host() private clicker,
          @Inject('api') @Host() @Optional() private api,
          @Inject('ngModel') @Host() @Self() private ngModel
        ) {}

      }

      const resolver = new DirectiveResolver();
      const actual = resolver.getRequiredDirectivesMap(Foo);
      const expected = {
        clicker: '^clicker',
        api: '?^api',
        ngModel: 'ngModel'
      };

      expect(actual).to.deep.equal(expected);

    } );

    it( `should return empty StringMap when no directive injected`, ()=> {

      @Directive({selector:'[foo]'})
      class Foo{
        constructor(
          @Inject('$log') private $log
        ){}
      }

      const resolver = new DirectiveResolver();
      const actual = resolver.getRequiredDirectivesMap(Foo);
      const expected = {};

      expect(actual).to.deep.equal(expected);

    } );

    it( `should throw if Inject is missing inject token`, ()=> {

      @Directive({selector:'[foo]'})
      class Foo{
        constructor(
          @Inject('') @Host() private ngModel
        ){}
      }

      const resolver = new DirectiveResolver();

      expect(()=>resolver.getRequiredDirectivesMap(Foo)).to.throw(
        `no Directive instance name provided within @Inject()`
      );

    } );

    it( `should throw if both @Self and @SkipSelf are used`, ()=> {

      @Directive({selector:'[foo]'})
      class Foo{
        constructor(
          @Inject('ngModel') @Host() @SkipSelf() @Self() private ngModel
        ){}
      }

      const resolver = new DirectiveResolver();

      expect(()=>resolver.getRequiredDirectivesMap(Foo)).to.throw(
        `you cannot provide both @Self() and @SkipSelf() for @Inject(ngModel)`
      );

    } );

  } );


} );
