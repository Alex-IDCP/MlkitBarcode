import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NonTradePurchaseReqApprovalsPage } from './non-trade-purchase-req-approvals.page';

describe('NonTradePurchaseReqApprovalsPage', () => {
  let component: NonTradePurchaseReqApprovalsPage;
  let fixture: ComponentFixture<NonTradePurchaseReqApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(NonTradePurchaseReqApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
