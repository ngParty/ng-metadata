import {expect} from 'chai';
import {AfterContentInit} from '../src/life_cycle';
import {Component,Directive,Output,Input,Attr,makeDirective} from '../src/directives';
import {OnInit} from "../src/life_cycle";
import {OnDestroy} from "../src/life_cycle";

describe( 'directives', function () {

  let scope;
  let element;
  let attrs;

  beforeEach( function () {

    scope = {
      _cb: [],
      $on( event: string, callback: Function ){
        this._cb.push( callback );
      },
      $destroy(){
        this._cb.forEach( ( cb )=>cb() );
      }
    };
    element = {};
    attrs = {};

  } );

  function _destroyLink() {
    scope.$destroy();
  }

  function _invokeLink( controllers, linkFn ) {

    const instances = controllers.map( ( constructorFn )=>new constructorFn() );

    linkFn( scope, element, attrs, instances );

  }

  describe( 'makeDirective', function () {

    it( 'should throw error when you try make directive/component from non directive Type', function () {

      class ImNotWhatYouThink {

        static toString() {
          return ImNotWhatYouThink[ 'name' ];
        }

      }
      function _willThrow() {
        makeDirective( ImNotWhatYouThink );
      }

      expect( _willThrow ).to.throw( `ImNotWhatYouThink must be @Component/@Directive` );

    } );

    it( 'should create directive factory when correct Type provided', function () {

      @Component( {
        selector: 'yes',
        template: 'Yay pirate!'
      } )
      class YesCmp {

      }

      function _willThrow() {
        makeDirective( YesCmp );
      }

      expect( _willThrow ).to.not.throw();
      expect( typeof makeDirective( YesCmp ) ).to.equal( 'function' );
      expect( Object.keys( makeDirective( YesCmp )() ) ).to.deep.equal( [
        'restrict',
        'controller',
        'controllerAs',
        'scope',
        'bindToController',
        'transclude',
        'require',
        'link',
        'template'
      ] );

    } );

  } );
  describe( 'property Decorators', function () {

    describe( 'Output', function () {

      it( 'should register expression binding on component via @Output applied on property', function () {

        @Component( {
          selector: 'my-cmp',
          outputs: [ 'onFoo' ]
        } )
        class MyCmp {

          @Output() onNameChange: Function;
          @Output( 'onType' ) onInput: Function;

        }
        const _ddo = MyCmp[ '_ddo' ];

        expect( _ddo.bindToController ).to.deep.equal( {
          'onFoo': '&',
          'onNameChange': '&',
          'onInput': '&onType'
        } );

      } );

    } );
    describe( 'Input', function () {

      it( 'should register expression binding on component via @Output applied on property', function () {

        @Component( {
          selector: 'my-cmp',
          inputs: [ 'name' ]
        } )
        class MyCmp {

          @Input() surname: string;
          @Input( 'broName' ) nickname: string;

        }
        const _ddo = MyCmp[ '_ddo' ];

        expect( _ddo.bindToController ).to.deep.equal( {
          'name': '=',
          'surname': '=',
          'nickname': '=broName'
        } );

      } );

    } );
    describe( 'Attr', function () {

      it( 'should register expression binding on component via @Output applied on property', function () {

        @Component( {
          selector: 'my-cmp',
          attrs: [ 'foo' ]
        } )
        class MyCmp {

          @Attr() bar: string;
          @Attr( 'heyYa' ) baz: string;

        }
        const _ddo = MyCmp[ '_ddo' ];

        expect( _ddo.bindToController ).to.deep.equal( {
          'foo': '@',
          'bar': '@',
          'baz': '@heyYa'
        } );

      } );

    } );
    describe( 'Output/Input/Attr together', function () {

      it( 'should correctly create bindings via Output,Input,Attr or Component bindings', function () {


        @Component( {
          selector: 'my-cmp',
          attrs: [ 'foo' ],
          inputs: [ 'name' ],
          outputs: [ 'onMoo' ]
        } )
        class MyCmp {

          @Attr() bar: string;
          @Input() surname: string;
          @Output() onNameChange: Function;

        }
        const _ddo = MyCmp[ '_ddo' ];

        expect( _ddo.bindToController ).to.deep.equal( {
          'foo': '@',
          'bar': '@',
          'name': '=',
          'surname': '=',
          'onMoo': '&',
          'onNameChange': '&'
        } );

      } );

    } );

  } );
  describe( 'Directive', function () {

    it( 'should decorate a class with selector and proper ddo static properties specific for directive', function () {

      @Directive( {
        selector: '[my-attr]'
      } )
      class MyAttr {
      }
      const _ddo = MyAttr[ '_ddo' ];


      expect( MyAttr[ 'selector' ] ).to.equal( '[my-attr]' );
      expect( Object.keys( _ddo ) ).to.deep.equal( [
        'restrict',
        'controller',
        'require',
        'link'
      ] );
      expect( _ddo.require ).to.deep.equal( [ 'myAttr' ] );
      expect( _ddo.restrict ).to.equal( 'A' );

    } );

    it( 'should register require correctly', function () {

      @Directive( {
        selector: '[my-attr]',
        legacy: {
          require: [ 'NgModel', '^someFoo' ]
        }
      } )
      class MyAttr {
      }

      const _ddo = MyAttr[ '_ddo' ];
      expect( _ddo.require ).to.deep.equal( [ 'myAttr', 'NgModel', '^someFoo' ] );

    } );

    it( 'should allow legacy angular 1 syntax for ddo', function () {

      @Directive( {
        selector: 'my-attr',
        legacy: {
          terminal: true,
          priority: 200,
          transclude: 'element'
        }
      } )
      class MyAttr {
      }

      const _ddo = MyAttr[ '_ddo' ];
      expect( _ddo.terminal ).to.equal( true );
      expect( _ddo.priority ).to.equal( 200 );
      expect( _ddo.transclude ).to.equal( 'element' );

    } );

    describe( 'lifecycle hooks', function () {

      it( 'should call #afterContentInit from postLink', ()=> {

        class SomeFoo {}
        class Parent {}

        @Directive( {
          selector: '[my-attr]',
          legacy: {
            require: [ 'NgModel', '^someFoo', '^^parent' ]
          }
        } )
        class MyAttr implements AfterContentInit {
          static called = false;
          static someFoo = null;
          static parent = null;

          afterContentInit( controllers ) {

            const [someFoo,parent] = controllers;

            MyAttr.someFoo = someFoo;
            MyAttr.parent = parent;
            MyAttr.called = true;

          }
        }
        const _ddo: ng.IDirective = MyAttr[ '_ddo' ];
        const postLink = _ddo.link;

        _invokeLink( [ MyAttr, SomeFoo, Parent ], postLink );

        expect( MyAttr.called ).to.equal( true );
        expect( MyAttr.someFoo instanceof SomeFoo ).to.equal( true );
        expect( MyAttr.parent instanceof Parent ).to.equal( true );

      } );

      it( 'should throw error when requiring directive and #afterContentInit is not defined', function () {

        @Directive( {
          selector: '[my-attr]',
          legacy: {
            require: [ 'NgModel', '^someFoo' ]
          }
        } )
        class MyAttr {
          static called = false;
        }
        const _ddo: ng.IDirective = MyAttr[ '_ddo' ];
        const postLink = _ddo.link;

        function _willThrow() {
          _invokeLink( [ MyAttr ], postLink )
        }

        expect( _willThrow ).to.throw( `@Directive/@Component must implement #afterContentInit method` );

      } );

      it( `should throw error when controllers are required and afterContentInit doesn't have correct method signature`,
        ()=> {

          class SomeFoo {}
          class NgModel {}

          @Directive( {
            selector: '[my-attr]',
            legacy: {
              require: [ 'NgModel', '^someFoo' ]
            }
          } )
          class MyAttr implements AfterContentInit {

            afterContentInit() {}

          }
          const _ddo: ng.IDirective = MyAttr[ '_ddo' ];
          const postLink = _ddo.link;

          function _willThrow() {
            _invokeLink( [ MyAttr, NgModel, SomeFoo ], postLink )
          }

          expect( _willThrow ).to.throw();

        }
      );

      it( 'should call #onDestroy. if defined, from postLink on $scope.$destroy', ()=> {

        class NgModel {}

        @Directive( {
          selector: '[my-attr]'
        } )
        class MyAttr implements AfterContentInit,OnDestroy {
          static destroyed = false;
          static called = false;

          onDestroy() {
            MyAttr.destroyed = true;
          }

          afterContentInit() {
            MyAttr.called = true;
          }
        }
        const _ddo: ng.IDirective = MyAttr[ '_ddo' ];
        const postLink = _ddo.link;

        _invokeLink( [ MyAttr ], postLink );
        expect( MyAttr.called ).to.equal( true );
        expect( MyAttr.destroyed ).to.equal( false );

        _destroyLink();
        expect( MyAttr.destroyed ).to.equal( true );

      } );

    } );

  } );
  describe( 'Component', function () {

    it( 'should decorate a class with selector and proper ddo static properties', function () {

      @Component( {
        selector: 'my-cmp',
        template: `hello world`
      } )
      class MyCmp {
      }

      const _ddo = MyCmp[ '_ddo' ];
      expect( MyCmp[ 'selector' ] ).to.equal( 'my-cmp' );
      expect( Object.keys( _ddo ) ).to.deep.equal( [
        'restrict',
        'controller',
        'controllerAs',
        'scope',
        'bindToController',
        'transclude',
        'require',
        'link',
        'template'
      ] );

      expect( _ddo.require ).to.deep.equal( [ 'myCmp' ] );
      expect( _ddo.restrict ).to.equal( 'E' );
      expect( _ddo.template ).to.equal( 'hello world' );

    } );

    it( 'should register require correctly', function () {

      @Component( {
        selector: 'my-cmp',
        template: `hello world`,
        legacy: {
          require: '^foo'
        }
      } )
      class MyCmp {
      }

      const _ddo = MyCmp[ '_ddo' ];
      expect( _ddo.require ).to.deep.equal( [ 'myCmp', '^foo' ] );

    } );

    it( 'should allow legacy angular 1 syntax for ddo', function () {

      @Component( {
        selector: 'my-cmp',
        template: `hello world`,
        legacy: {
          terminal: true,
          priority: 200,
          transclude: false
        }
      } )
      class MyCmp {
      }

      const _ddo = MyCmp[ '_ddo' ];
      expect( _ddo.terminal ).to.equal( true );
      expect( _ddo.priority ).to.equal( 200 );
      expect( _ddo.transclude ).to.equal( false );

    } );

    it( 'should correctly transform inputs|outputs|attrs to =,&,@', function () {

      @Component( {
        selector: 'my-cmp',
        inputs: [ 'name', 'internal:publicApi' ],
        attrs: [ 'nickName' ],
        outputs: [ 'onNameChange', 'internalOnFoo:publicOnFoo' ],
        template: `hello world`,
      } )
      class MyCmp {
      }

      const _ddo = MyCmp[ '_ddo' ];

      expect( _ddo.bindToController.name ).to.equal( '=' );
      expect( _ddo.bindToController.nickName ).to.equal( '@' );
      expect( _ddo.bindToController.onNameChange ).to.equal( '&' );
      expect( _ddo.bindToController.internal ).to.equal( '=publicApi' );
      expect( _ddo.bindToController.internalOnFoo ).to.equal( '&publicOnFoo' );

    } );

    describe( 'lifecycle hooks', function () {

      it( 'should call #afterContentInit from postLink if implemented', function () {

        @Component( {
          selector: '[my-name]',
          template: `hello`
        } )
        class MyCmp implements AfterContentInit {
          static called = false;

          afterContentInit() {
            MyCmp.called = true;
          }
        }
        const _ddo: ng.IDirective = MyCmp[ '_ddo' ];
        const postLink = _ddo.link;

        _invokeLink( [ MyCmp ], postLink );

        expect( MyCmp.called ).to.equal( true );

      } );

      it( 'should call #afterContentInit with array of requires as argument', function () {

        class Foo {}
        class Bar {}

        @Component( {
          selector: '[my-name]',
          template: `hello`,
          legacy: {
            require: [ 'foo', '^bar' ]
          }
        } )
        class MyCmp implements AfterContentInit {
          static foo = null;
          static bar = null;

          afterContentInit( controllers ) {
            const [foo,bar] = controllers;
            MyCmp.foo = foo;
            MyCmp.bar = bar;
          }

        }
        const _ddo: ng.IDirective = MyCmp[ '_ddo' ];
        const postLink = _ddo.link;

        _invokeLink( [ MyCmp, Foo, Bar ], postLink );

        expect( MyCmp.foo instanceof Foo ).to.equal( true );
        expect( MyCmp.bar instanceof Bar ).to.equal( true );

      } );

      it( 'should not throw error when #afterContentInit is not defined and no require present', function () {

        @Component( {
          selector: '[my-name]',
          template: `hello`
        } )
        class MyCmp {
          static called = false;
        }
        const _ddo: ng.IDirective = MyCmp[ '_ddo' ];
        const postLink = _ddo.link;

        function _willThrow() {
          _invokeLink( [ MyCmp ], postLink )
        }

        expect( _willThrow ).to.not.throw( `@Directive/@Component must implement #afterContentInit method` );

      } );

      it( `should throw error when controllers are required and #afterContentInit doesn't have correct method signature`,
        ()=> {

          class SomeFoo {}
          class NgModel {}

          @Component( {
            selector: '[my-name]',
            template: `hello`,
            legacy: {
              require: [ 'NgModel', '^someFoo' ]
            }
          } )
          class MyCmp implements AfterContentInit {

            afterContentInit() { }

          }
          const _ddo: ng.IDirective = MyCmp[ '_ddo' ];
          const postLink = _ddo.link;

          function _willThrow() {
            _invokeLink( [ MyCmp, NgModel, SomeFoo ], postLink )
          }

          expect( _willThrow ).to.throw();

        } );

    } );

  } );

} );
