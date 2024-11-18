import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CoTransferOutReviewPage } from './co-transfer-out-reviews.page';

describe('CoTransferOutReviewPage', () => {
  let component: CoTransferOutReviewPage;
  let fixture: ComponentFixture<CoTransferOutReviewPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(CoTransferOutReviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
