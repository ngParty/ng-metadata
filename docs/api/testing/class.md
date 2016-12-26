# Class

**Testing helpers**

- [TestBed](#testbed)

---

## TestBed
TestBed is the primary api for writing unit tests for Angular 2+ applications.


###### members



| members                    | Type                                        | Description                                  |
| -------------------------- | ------------------------------------------- |--------------------------------------------- |
| **configureTestingModule** | `(metadata: NgModuleMetadata): TestBed`     | Allows registering and overriding providers and declarations. |
| **get**                    | `(token: any): any`                         | Returns an injectable instance via the token.                 |
| **createComponent**        | `(component: Type<T>): ComponentFixture<T>` | Create a fixture with a component instance.                   |


*Example:*

```typescript
// app.component.spec.ts
import * as angular from 'angular';
import { expect } from 'chai';
import { AppComponent } from './app.component';
import { TestBed } from 'ng-metadata/testing';

describe(`AppComponent with TestBed`, () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  let element: HTMLElement;
  let de: debugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({declarations: [AppComponent]});
    fixture = TestBed.createComponent<AppComponent>(AppComponent);
    app = fixture.componentInstance; // to access properties and methods
    element = fixture.nativeElement  // to access DOM element
    de = fixture.debugElement;       // test helper
  });

  it('should render `Hello World!`', () => {
    expect(app.planet).toBe('Pluto');
    fixture.detectChanges();
    expect(element.querySelector('h1').innerText).toBe('Hello from Pluto !');

    app.planet = 'Earth';
    fixture.detectChanges();
    expect(element.querySelector('h1').innerText).toBe('Hello from Earth !');
  });
  
});
