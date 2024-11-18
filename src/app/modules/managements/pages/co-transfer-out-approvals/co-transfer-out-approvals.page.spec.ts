import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CoTransferOutApprovalsPage } from './co-transfer-out-approvals.page';

describe('CoTransferOutApprovalsPage', () => {
  let component: CoTransferOutApprovalsPage;
  let fixture: ComponentFixture<CoTransferOutApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(CoTransferOutApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
