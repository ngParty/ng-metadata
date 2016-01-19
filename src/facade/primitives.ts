import {isNumber} from "./lang";


const _kebabCase = _caseTransformerFactory('-');
const _snakeCase = _caseTransformerFactory('_');

export class StringWrapper {
  static fromCharCode( code: number ): string { return String.fromCharCode( code ); }

  static charCodeAt( s: string, index: number ): number { return s.charCodeAt( index ); }

  static split( s: string, regExp: RegExp ): string[] { return s.split( regExp ); }

  static equals( s: string, s2: string ): boolean { return s === s2; }

  static stripLeft( s: string, charVal: string ): string {
    if ( s && s.length ) {
      var pos = 0;
      for ( var i = 0; i < s.length; i++ ) {
        if ( s[ i ] != charVal ) break;
        pos++;
      }
      s = s.substring( pos );
    }
    return s;
  }

  static stripRight( s: string, charVal: string ): string {
    if ( s && s.length ) {
      var pos = s.length;
      for ( var i = s.length - 1; i >= 0; i-- ) {
        if ( s[ i ] != charVal ) break;
        pos--;
      }
      s = s.substring( 0, pos );
    }
    return s;
  }

  static replace( s: string, from: string, replace: string ): string {
    return s.replace( from, replace );
  }

  static replaceAll( s: string, from: RegExp, replace: string ): string {
    return s.replace( from, replace );
  }

  static slice<T>( s: string, from: number = 0, to: number = null ): string {
    return s.slice( from,
      to === null
        ? undefined
        : to );
  }

  static replaceAllMapped( s: string, from: RegExp, cb: Function ): string {
    return s.replace( from, function ( ...matches ) {
      // Remove offset & string from the result array
      matches.splice( -2, 2 );
      // The callback receives match, p1, ..., pn
      return cb( matches );
    } );
  }


  static compare( a: string, b: string ): number {
    if ( a < b ) {
      return -1;
    } else if ( a > b ) {
      return 1;
    } else {
      return 0;
    }
  }

  static includes( str: string, searchString: string, position: number = 0){
    if ( (String.prototype as any).includes ) {
      return (str as any).includes( searchString, position );
    }
    return str.indexOf( searchString, position ) === position;
  }

  static startsWith( str: string, searchString: string, position: number = 0 ) {
    if ( (String.prototype as any).startsWith ) {
      return (str as any).startsWith( searchString, position );
    }
    return str.indexOf( searchString, position ) === position;
  }

  static endsWith( str: string, searchString: string, position?: number ) {

    if ( (String.prototype as any).endsWith ) {
      return (str as any).endsWith( searchString, position );
    }

    const subjectString = str.toString();
    if (
      !isNumber( position ) || !isFinite( position )
      || Math.floor( position ) !== position || position > subjectString.length
    ) {
      position = subjectString.length;
    }
    position -= searchString.length;
    const lastIndex = subjectString.indexOf( searchString, position );
    return lastIndex !== -1 && lastIndex === position;

  }

  static kebabCase( name: string ) {
    return _kebabCase( name );
  }
  static snakeCase( name: string ) {
    return _snakeCase( name );
  }

}

function _caseTransformerFactory( separator: string ): ( name: string )=>string {

  const SNAKE_CASE_REGEXP = /[A-Z]/g;

  return _caseTransform;

  function _caseTransform( name ) {
    return name.replace( SNAKE_CASE_REGEXP, function ( match: string, offset: number ) {
      return (
          offset
            ? separator
            : ''
        ) + match.toLowerCase();
    } );
  }

}
