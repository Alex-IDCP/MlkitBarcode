import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NonTradePurchaseReqReviewsPage } from './non-trade-purchase-req-reviews.page';

describe('NonTradePurchaseReqReviewsPage', () => {
  let component: NonTradePurchaseReqReviewsPage;
  let fixture: ComponentFixture<NonTradePurchaseReqReviewsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(NonTradePurchaseReqReviewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
