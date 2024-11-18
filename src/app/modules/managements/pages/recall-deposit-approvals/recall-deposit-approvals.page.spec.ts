import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RecallDepositApprovalsPage } from './recall-deposit-approvals.page';

describe('RecallDepositApprovalsPage', () => {
  let component: RecallDepositApprovalsPage;
  let fixture: ComponentFixture<RecallDepositApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(RecallDepositApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
