import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PaymentArrangementReviewsPage } from './payment-arrangement-reviews.page';

describe('PaymentArrangementReviewsPage', () => {
  let component: PaymentArrangementReviewsPage;
  let fixture: ComponentFixture<PaymentArrangementReviewsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(PaymentArrangementReviewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
