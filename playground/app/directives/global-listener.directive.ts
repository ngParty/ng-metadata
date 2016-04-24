import { Directive, HostListener } from 'ng-metadata/core';

@Directive( {
  selector: '[my-global-listener]',
} )
export class GlobalListenerDirective {

  @HostListener( 'document: click', [ '$event' ] )
  onDocumentClick() {
    console.log( 'document was clicked!!!' );
  }

  @HostListener( 'window: resize' )
  onResize() {
    console.log( 'window resized!!!' );
  }

  @HostListener( 'body: keydown', [ '$event.which' ] )
  onKeyDown( keyCode: number ) {
    console.log( `keydown on document!!!: ${keyCode}` );
  }

}
