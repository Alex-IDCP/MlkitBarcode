import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PurchaseReqApprovalsPage } from './purchase-req-approvals.page';

describe('PurchaseReqApprovalsPage', () => {
  let component: PurchaseReqApprovalsPage;
  let fixture: ComponentFixture<PurchaseReqApprovalsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseReqApprovalsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseReqApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
