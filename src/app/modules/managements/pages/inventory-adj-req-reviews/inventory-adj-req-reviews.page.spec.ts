import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryAdjReqReviewsPage } from './inventory-adj-req-reviews.page';

describe('InventoryAdjReqReviewsPage', () => {
  let component: InventoryAdjReqReviewsPage;
  let fixture: ComponentFixture<InventoryAdjReqReviewsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(InventoryAdjReqReviewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
