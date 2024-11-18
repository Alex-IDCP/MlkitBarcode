import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NonTradePurchaseReqDetailPage } from './non-trade-purchase-req-detail.page';

describe('NonTradePurchaseReqDetailPage', () => {
  let component: NonTradePurchaseReqDetailPage;
  let fixture: ComponentFixture<NonTradePurchaseReqDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(NonTradePurchaseReqDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
