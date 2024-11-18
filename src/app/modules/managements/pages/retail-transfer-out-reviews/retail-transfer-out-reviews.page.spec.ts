import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RetailTransferOutReviewPage } from './retail-transfer-out-reviews.page';

describe('RetailTransferOutReviewPage', () => {
  let component: RetailTransferOutReviewPage;
  let fixture: ComponentFixture<RetailTransferOutReviewPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(RetailTransferOutReviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
