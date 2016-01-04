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


describe( `linker/directive_resolver`, ()=> {

  it( `should return Directive metadata if exists on provided type`, ()=> {

    @Directive({
      selector:'[myAttr]'
    })
    class MyDirective{}

    const resolver = new DirectiveResolver();
    const actual = resolver.resolve( MyDirective );
    const expected = true;

    expect( actual instanceof DirectiveMetadata ).to.equal( expected );

  } );

  it( `should return Component metadata if exists on provided type`, ()=> {

    @Component({
      selector:'myComp',
      template:'hello world'
    })
    class MyComponent{}

    const resolver = new DirectiveResolver();
    const actual = resolver.resolve( MyComponent );
    const expected = true;

    expect( actual instanceof ComponentMetadata ).to.equal( expected );

  } );


  it( `should throw error when provided type doesn't have Directive/Component metadata`, ()=> {

    class NoDirective {}

    const resolver = new DirectiveResolver();

    expect( ()=>resolver.resolve( NoDirective ) ).to.throw(`No Directive annotation found on ${stringify(NoDirective)}`);

  } );

  it( `should update Class Metadata object accordingly with provided property Annotations`, ()=> {

    @Directive({
      selector:'[myClicker]'
    })
    class MyClicker{

      @Input() one: string;
      @Input('outsideAlias') inside: string;
      @Output() onOne: Function;
      @Output('onOutsideAlias') onInside: Function;

      @HostBinding('class.disabled') isDisabled: boolean;

      @HostListener('mousemove',['$event.target'])
      onMove(){}

    }

    const resolver = new DirectiveResolver();

    const actual = resolver.resolve( MyClicker );
    const expected = new DirectiveMetadata({
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
      host:{
        '[class.disabled]':'isDisabled',
        '(mousemove)':'onMove($event.target)',
      },
      exportAs: undefined,
      queries: {},
      providers: undefined
    });

    expect(actual).to.deep.equal(expected);

  } );

  it( `should update merge Class Metadata object with provided property Annotations`, ()=> {

    @Component({
      selector:'jedi',
      template:'<div>The force is strong</div>',
      inputs:['one'],
      outputs:['onOne'],
      attrs:['name: publicName'],
      host:{
        '[class.enabled]':'isEnabled',
        '(mouseout)':'onMoveOut()'
      },
      legacy:{
        controllerAs:'jedi'
      }
    })
    class JediComponent{

      @Attr() id: string;
      @Attr('attrAlias') noAlias: string;

      public one: string;
      @Input('outsideAlias') inside: string;
      public onOne: Function;
      @Output('onOutsideAlias') onInside: Function;

      @HostBinding('class.disabled') isDisabled: boolean;
      private get isEnabled(){ return true };

      @HostListener('mousemove',['$event.target'])
      onMove(){}

      onMoveOut(){}

    }

    const resolver = new DirectiveResolver();

    const actual = resolver.resolve( JediComponent );
    const expected = new ComponentMetadata({
      selector: 'jedi',
      template:'<div>The force is strong</div>',
      inputs: [
        'one',
        'inside: outsideAlias'
      ],
      attrs:[
        'name: publicName',
        'id',
        'noAlias: attrAlias'
      ],
      outputs: [
        'onOne',
        'onInside: onOutsideAlias'
      ],
      host:{
        '[class.disabled]':'isDisabled',
        '[class.enabled]': 'isEnabled',
        '(mousemove)':'onMove($event.target)',
        '(mouseout)': 'onMoveOut()'
      },
      exportAs: undefined,
      queries: {},
      providers: undefined,
      legacy:{
        controllerAs:'jedi'
      }
    });

    expect(actual).to.deep.equal(expected);

  } );

} );
