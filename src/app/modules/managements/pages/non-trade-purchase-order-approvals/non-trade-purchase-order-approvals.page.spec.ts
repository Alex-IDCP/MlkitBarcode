import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NonTradePurchaseOrderApprovalsPage } from './non-trade-purchase-order-approvals.page';

describe('NonTradePurchaseOrderApprovalsPage', () => {
  let component: NonTradePurchaseOrderApprovalsPage;
  let fixture: ComponentFixture<NonTradePurchaseOrderApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(NonTradePurchaseOrderApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
