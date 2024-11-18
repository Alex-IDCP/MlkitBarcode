import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RefundApprovalsPage } from './refund-approvals.page';

describe('RefundApprovalsPage', () => {
  let component: RefundApprovalsPage;
  let fixture: ComponentFixture<RefundApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(RefundApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
