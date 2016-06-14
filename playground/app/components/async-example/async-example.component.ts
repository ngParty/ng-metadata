import { Observable } from 'rxjs/Observable'
import { Subscriber } from 'rxjs/Subscriber'
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/scan';
import { Component, Inject } from 'ng-metadata/core';

@Component({
  selector: 'async-task',
  template: (
    `Clock: {{ $ctrl.clock$ | async:this | date:'M/d/yy h:mm:ss a' }} <br>
     Timer: {{ $ctrl.timer$ | async:this }} <br>
     Async Stream via scan:
     <ul><li ng-repeat="u in $ctrl.stream$ | async:this">{{ u }}</li></ul>`
  )
})
class AsyncTaskComponent {

  clock$ = Observable.create((observer: Subscriber<number>) => {
    this.$interval(() => observer.next(new Date().getTime()), 500);
  });
  timer$ = Observable.interval(1000).take(50);
  stream$ = Observable.interval(1500).take(10).scan((acc, item) => [...acc, item], []);

  constructor(@Inject('$interval') private $interval: ng.IIntervalService){}

}

@Component({
  selector: 'async-example',
  directives: [AsyncTaskComponent],
  template: (
    `<button ng-click="$ctrl.renderTimers=!$ctrl.renderTimers">Show Timers</button>
     <async-task ng-if="$ctrl.renderTimers"></async-task>
     <br>
    <div>
      <p>Wait for it... {{ $ctrl.greeting | async }}</p>
      <button ng-click="$ctrl.clicked()">{{ $ctrl.arrived ? 'Reset' : 'Resolve' }}</button>
    </div>
    <div>
      <h4>Rx repos:</h4>
      <blockquote ng-hide="$ctrl.repos | async">Loading...</blockquote>
      <ul>
        <li ng-repeat="repo in $ctrl.repos | async">
          <a href="{{ repo.html_url }}" target="_blank">
            {{ repo.name }}
          </a>
        </li>
      </ul>
      <pre style="overflow:auto;max-height:250px;">{{ $ctrl.repos | async | json }}</pre>
    </div>
    `
  )
})
export class AsyncExampleComponent {

  greeting: ng.IPromise<string> = null;
  arrived: boolean = false;

  repos = this.$http.get('https://api.github.com/orgs/Reactive-Extensions/repos');

  private resolve: Function = null;

  constructor(
    @Inject('$q') private $q:ng.IQService,
    @Inject('$http') private $http:ng.IHttpService
  ) {
    this.reset();
  }

  reset() {
    this.arrived = false;
    this.greeting = this.$q((resolve, reject) => { this.resolve = resolve; });
  }

  clicked() {
    if (this.arrived) {
      this.reset();
    } else {
      this.resolve('hi there!');
      this.arrived = true;
    }
  }
}
