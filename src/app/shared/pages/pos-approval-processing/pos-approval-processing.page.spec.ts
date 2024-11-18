import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PosApprovalProcessingPage } from './pos-approval-processing.page';

describe('PosApprovalProcessingPage', () => {
  let component: PosApprovalProcessingPage;
  let fixture: ComponentFixture<PosApprovalProcessingPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(PosApprovalProcessingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
