import * as angular from 'angular';
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnChanges,
  Injectable,
  Input,
  SimpleChange
} from 'ng-metadata/core';

@Component( {
  selector: 'mark-for-check',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `Number of ticks inside child: {{ $ctrl.ticks }}`
} )
export class MarkForCheckComponent implements OnInit {
  @Input() ticks;

  constructor( private ref: ChangeDetectorRef ) {}

  ngOnInit() {
    setInterval( () => {
      this.ticks++;
      // the following is required, otherwise the view and parent component will not be updated
      this.ref.markForCheck();
      // if we call instead detectChanges, only view and children will be updated
      // this.ref.detectChanges();
    }, 1000 );
  }

}

@Injectable()
export class DataProvider {

  private _data = [ 1, 2, 3 ];
  private _interval;

  constructor(){
    this.init();
  }
  // in a real application the returned data will be different every time
  get data() {
    return this._data;
  }

  private init(){
    this._interval = setInterval(()=>{
      this._data = [...this._data,...this._data.slice(-2).map(num=>num*2)];
    },3000);
  }

  toggleTimer(){
    if(this._interval){
      clearInterval(this._interval);
      this._interval = undefined;
    }else{
      this.init();
    }
  }

  isTimerRunning(){
    return angular.isDefined(this._interval);
  }
}

@Component( {
  selector: 'detach',
  template: `
    <li ng-repeat="d in $ctrl.dataProvider.data track by $index">Data {{d}}</li>
  `
} )
export class DetachComponent {
  constructor( private ref: ChangeDetectorRef, private dataProvider: DataProvider ) {
    ref.detach();
    setInterval( () => {
      this.ref.detectChanges();
    }, 5000 );
  }
}

@Injectable()
export class DataProvider2 {
  data = 1;

  constructor() {
    setInterval( () => {
      this.data = this.data * 2;
    }, 2500 );
  }
}

@Component( {
  selector: 'reattach',
  template: `Data: {{$ctrl.dataProvider.data}}`
} )
export class ReattachComponent implements OnChanges {

  @Input( '<' ) live: boolean;

  constructor( private ref: ChangeDetectorRef, private dataProvider: DataProvider2 ) {}

  ngOnChanges( changes ) {
    const liveChange = changes.live as SimpleChange;
    if ( liveChange ) {
      if ( liveChange.currentValue ) {
        this.ref.reattach();
      } else {
        this.ref.detach();
      }
    }
  }

}


@Component( {
  selector: 'change-detector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h4>Mark for check example:</h4>
    <div>
    Number of ticks inside parent: {{ $ctrl.numberOfTicks }}
    <mark-for-check ticks="$ctrl.numberOfTicks"></mark-for-check>
    </div>

    <h4>Detach example:</h4>
    <div>
      <button ng-click="$ctrl.dataProvider.toggleTimer()">
        {{ $ctrl.dataProvider.isTimerRunning() ? 'Stop' : 'Start'}} getting data
      </button>
      <detach></detach>
    </div>

    <h4>Reattach example:</h4>
    <div>
      Live Update: <input type="checkbox" ng-model="$ctrl.live">
      <reattach live="$ctrl.live"></reattach>
    </div>

    <style>
      reattach,detach,mark-for-check {
        display: block;
        background: LightYellow; padding: 8px; margin-top: 8px
      }
    </style>
  `,
  providers: [ DataProvider, DataProvider2 ],
  directives: [ MarkForCheckComponent, DetachComponent, ReattachComponent ]
} )
export class ChangeDetectorComponent {
  live = true;
  numberOfTicks = 0;

  constructor(private dataProvider: DataProvider){}
}
