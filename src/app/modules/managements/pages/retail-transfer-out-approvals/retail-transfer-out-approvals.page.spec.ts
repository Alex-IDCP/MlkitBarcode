import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RetailTransferOutApprovalsPage } from './retail-transfer-out-approvals.page';

describe('RetailTransferOutApprovalsPage', () => {
  let component: RetailTransferOutApprovalsPage;
  let fixture: ComponentFixture<RetailTransferOutApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(RetailTransferOutApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
