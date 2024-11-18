import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NonTradePurchaseOrderReviewsPage } from './non-trade-purchase-order-reviews.page';

describe('NonTradePurchaseOrderReviewsPage', () => {
  let component: NonTradePurchaseOrderReviewsPage;
  let fixture: ComponentFixture<NonTradePurchaseOrderReviewsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(NonTradePurchaseOrderReviewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
