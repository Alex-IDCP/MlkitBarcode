import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BacktobackOrderCartPage } from './backtoback-order-cart.page';

describe('BacktobackOrderCartPage', () => {
  let component: BacktobackOrderCartPage;
  let fixture: ComponentFixture<BacktobackOrderCartPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BacktobackOrderCartPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BacktobackOrderCartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
