import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PurchaseOrderApprovalsPage } from './purchase-order-approvals.page';

describe('PurchaseOrderApprovalsPage', () => {
  let component: PurchaseOrderApprovalsPage;
  let fixture: ComponentFixture<PurchaseOrderApprovalsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderApprovalsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
