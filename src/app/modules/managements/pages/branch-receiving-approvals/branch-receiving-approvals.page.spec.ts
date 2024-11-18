import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BranchReceivingApprovalsPage } from './branch-receiving-approvals.page';

describe('BranchReceivingApprovalsPage', () => {
  let component: BranchReceivingApprovalsPage;
  let fixture: ComponentFixture<BranchReceivingApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(BranchReceivingApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
