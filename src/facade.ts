declare var global;

const angular = ((win)=> {

  if ( win ) {

    return win[ 'angular' ];

  }

  // this is for Node
  return {
    extend: Object[ 'assign' ]
  }

})( window );


export default angular;
