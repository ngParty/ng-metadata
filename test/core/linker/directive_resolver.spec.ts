import { expect } from 'chai';
import { stringify } from '../../../src/facade/lang';
import { DirectiveMetadata, ComponentMetadata } from '../../../src/core/directives/metadata_directives';
import {
  Directive,
  Component,
  Input,
  Output,
  HostBinding,
  HostListener,
  Attr,
  ContentChild,
  ViewChildren,
  ContentChildren
} from '../../../src/core/directives/decorators';
import { DirectiveResolver } from '../../../src/core/linker/directive_resolver';
import { Inject, Host, Self, Optional, SkipSelf } from '../../../src/core/di/decorators';
import { NgForm } from '../../../src/common/directives/ng_form';
import { NgModel } from '../../../src/common/directives/ng_model';


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

      @Directive({selector:'[someChild]'})
      class SomeChild{}

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

        @ContentChild(SomeChild) someChild: SomeChild;

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
        queries: {
          someChild: new ContentChild(SomeChild)
        },
        providers: undefined
      } );

      expect( actual ).to.deep.equal( expected );

    } );

    it( `should update merge Class Metadata object with provided property Annotations`, ()=> {

      @Directive({selector:'[anotherChild]'})
      class AnotherChild{}

      @Directive({selector:'[someContentChild]'})
      class SomeContentChild{}

      @Component({selector:'list',template:'im tree list'})
      class List{}

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
        queries:{
          anotherChild: new ContentChild(AnotherChild)
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

        @Input( 'outsideAlias' ) inside: string;

        public onOne: Function;

        @Output( 'onOutsideAlias' ) onInside: Function;

        @HostBinding( 'class.disabled' ) isDisabled: boolean;

        private get isEnabled() { return true };

        @HostListener( 'mousemove', [ '$event.target' ] )
        onMove() {}

        @ViewChildren(List) listViewChildren: List[];
        @ContentChildren(SomeContentChild) someContentChildren: SomeContentChild;

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
        queries: {
          anotherChild: new ContentChild(AnotherChild),
          someContentChildren: new ContentChildren(SomeContentChild),
          listViewChildren: new ViewChildren(List)
        },
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
          @Inject('ngModel') @Self() private ngModel,
          @Host() private form: NgForm
        ) {}

      }

      const resolver = new DirectiveResolver();
      const actual = resolver.getRequiredDirectivesMap(Foo);
      const expected = {
        'clicker#2': '^clicker',
        'api#3': '?^api',
        'ngModel#4': 'ngModel',
        'form#5':'^form'
      };

      expect(actual).to.deep.equal(expected);

    } );

    it( `should support Injectable as reference for directives and return require expression map`, ()=> {

      @Directive({selector:'[clicker]'})
      class MyClickerDirective{}

      @Directive({selector:'[api]'})
      class ApiDirective{}

      @Directive({selector:'[foo]'})
      class Foo{

        constructor(
          @Inject( '$log' ) private $log,
          @Inject( '$attrs' ) private $attrs,
          @Inject(MyClickerDirective) @Host() private clicker,
          @Host() @Optional() private api: ApiDirective,
          @Self() private ngModel: NgModel
        ) {}

      }

      const resolver = new DirectiveResolver();
      const actual = resolver.getRequiredDirectivesMap(Foo);
      const expected = {
        'clicker#2': '^clicker',
        'api#3': '?^api',
        'ngModel#4': 'ngModel'
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
          @Inject('ngModel') @SkipSelf() @Self() private ngModel
        ){}
      }

      const resolver = new DirectiveResolver();

      expect(()=>resolver.getRequiredDirectivesMap(Foo)).to.throw(
        `you cannot provide both @Self() and @SkipSelf() with @Inject(ngModel) for Directive Injection`
      );

    } );

    it( `should throw if both @Host()+@SkipSelf() are used for DI`, ()=> {

      @Directive({selector:'[foo]'})
      class Foo{
        constructor(
          @Inject('ngModel') @Host() @SkipSelf() private ngModel
        ){}
      }

      const resolver = new DirectiveResolver();

      expect( ()=>resolver.getRequiredDirectivesMap( Foo ) ).to.throw();

    } );

    it( `should throw if both @Host()+@Self() are used for DI`, ()=> {

      @Directive({selector:'[foo]'})
      class Foo{
        constructor(
          @Inject('ngModel') @Host() @Self() private ngModel
        ){}
      }

      const resolver = new DirectiveResolver();

      expect( ()=>resolver.getRequiredDirectivesMap( Foo ) ).to.throw();

    } );

    it( `should throw if @Optional() is used without one of @Self|@SkipSelf|@Host`, ()=> {

      @Directive({selector:'[foo]'})
      class Foo{
        constructor(
          @Inject('ngModel') @Optional() private ngModel
        ){}
      }

      const resolver = new DirectiveResolver();

      expect( ()=>resolver.getRequiredDirectivesMap( Foo ) ).to.throw();



    } );

  } );

  describe( `#componentModuleUrl`, () => {

    const resolver = new DirectiveResolver();

    function getComponentMetadata( modulePath: string ) {
      @Component( {
        selector: 'test',
        moduleId: modulePath,
        template: '...'
      } )
      class TestComponent {
      }

      return resolver.resolve( TestComponent ) as ComponentMetadata;
    }

    it( `should properly resolve module path`, () => {

      let metadata = getComponentMetadata( 'app/foo/bar/test.component.js' );
      let absolutePath = resolver.parseAssetUrl( metadata );

      expect( absolutePath ).to.equal( 'app/foo/bar/' );

      metadata = getComponentMetadata( 'https://foo-bar.com/foo/bar/test.js' );
      absolutePath = resolver.parseAssetUrl( metadata );

      expect( absolutePath ).to.equal( 'https://foo-bar.com/foo/bar/' );

      metadata = getComponentMetadata( 'test.js' );
      absolutePath = resolver.parseAssetUrl( metadata );

      expect( absolutePath ).to.equal( '/' );

      metadata = getComponentMetadata( '/test.js' );
      absolutePath = resolver.parseAssetUrl( metadata );

      expect( absolutePath ).to.equal( '/' );

      metadata = getComponentMetadata( '/app/test.js' );
      absolutePath = resolver.parseAssetUrl( metadata );

      expect( absolutePath ).to.equal( '/app/' );

      metadata = getComponentMetadata( 'https://foo-bar.com/foo?q=123/bar.js' );
      absolutePath = resolver.parseAssetUrl( metadata );

      expect( absolutePath ).to.equal( 'https://foo-bar.com/foo?q=123/' );

    } );

  } );


} );
