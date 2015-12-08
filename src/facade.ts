export function assign( destination: any, ...sources: any[] ): any {

  const innerAssign = Object[ 'assign' ] || window[ 'angular' ].extend;

  return innerAssign( destination, ...sources );

}
