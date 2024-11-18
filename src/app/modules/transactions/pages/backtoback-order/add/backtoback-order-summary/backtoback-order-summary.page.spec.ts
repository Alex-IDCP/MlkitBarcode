import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BacktobackOrderSummaryPage } from './backtoback-order-summary.page';

describe('BacktobackOrderSummaryPage', () => {
  let component: BacktobackOrderSummaryPage;
  let fixture: ComponentFixture<BacktobackOrderSummaryPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BacktobackOrderSummaryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BacktobackOrderSummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
