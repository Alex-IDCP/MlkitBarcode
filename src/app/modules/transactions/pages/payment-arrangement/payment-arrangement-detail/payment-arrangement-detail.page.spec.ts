import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PaymentArrangementDetailPage } from './payment-arrangement-detail.page';

describe('PaymentArrangementDetailPage', () => {
  let component: PaymentArrangementDetailPage;
  let fixture: ComponentFixture<PaymentArrangementDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(PaymentArrangementDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
