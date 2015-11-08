declare var global;

const angular = (()=> {

  if ( global ) {
    // this is for Node
    return {
      extend: Object[ 'assign' ]
    }
  } else {
    return window[ 'angular' ];
  }

})();


export default angular;
