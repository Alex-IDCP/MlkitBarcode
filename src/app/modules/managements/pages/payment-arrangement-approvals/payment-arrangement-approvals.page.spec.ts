import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PaymentArrangementApprovalsPage } from './payment-arrangement-approvals.page';

describe('PaymentArrangementApprovalsPage', () => {
  let component: PaymentArrangementApprovalsPage;
  let fixture: ComponentFixture<PaymentArrangementApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(PaymentArrangementApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
