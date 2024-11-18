import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BranchReceivingDetailPage } from './branch-receiving-detail.page';

describe('BranchReceivingDetailPage', () => {
  let component: BranchReceivingDetailPage;
  let fixture: ComponentFixture<BranchReceivingDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(BranchReceivingDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
