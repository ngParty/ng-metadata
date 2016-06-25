# Service

Service is just pure `ES6 class` with `@Injectable()` decorator, registered via `angular.service`.

**ES5**

```js
// user.service.js

angular.module('user')
  .service('userSvc',User);

User.$inject = ['$http'];
function User($http){

  this.hobbies = [];
  this.addHobby=function(name){
     this.hobbies.push(name);
  }

  this.getInfo = function(){
    return $http.get('/foo/bar/info')
      .then(function(response){
         return response.data;
      });
  }

}
```

```js
// user.js

angular.module('user',[]);
```


**TS + ng-metadata**

```typescript
// user.service.ts

import {Inject, Injectable} from 'ng-metadata/core';

@Injectable()
export class UserSvc{

  hobbies: string[] = [];

  constructor( @Inject('$http') private $http: ng.IHttpService ){}

  addHobby(name: string){
     this.hobbies.push(name);
  }

  getInfo(){
    return this.$http.get('/foo/bar/info')
      .then((response)=>response.data);
  }

}
```

```typescript
// user.ts

import * as angular from 'angular';
import {provide} from 'ng-metadata/core';
import {UserSvc} from './user.service';

angular.module('user',[])
  .service( ...provide(UserSvc) );
```
