import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BranchReceivingReviewsPage } from './branch-receiving-reviews.page';

describe('BranchReceivingReviewsPage', () => {
  let component: BranchReceivingReviewsPage;
  let fixture: ComponentFixture<BranchReceivingReviewsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(BranchReceivingReviewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
