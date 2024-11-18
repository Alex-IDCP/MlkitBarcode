import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryProcessingReviewsPage } from './inventory-processing-reviews.page';

describe('InventoryProcessingReviewsPage', () => {
  let component: InventoryProcessingReviewsPage;
  let fixture: ComponentFixture<InventoryProcessingReviewsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(InventoryProcessingReviewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
