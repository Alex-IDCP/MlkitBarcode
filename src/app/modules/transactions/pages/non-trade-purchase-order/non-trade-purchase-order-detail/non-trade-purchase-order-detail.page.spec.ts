import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NonTradePurchaseOrderDetailPage } from './non-trade-purchase-order-detail.page';

describe('NonTradePurchaseOrderDetailPage', () => {
  let component: NonTradePurchaseOrderDetailPage;
  let fixture: ComponentFixture<NonTradePurchaseOrderDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(NonTradePurchaseOrderDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
