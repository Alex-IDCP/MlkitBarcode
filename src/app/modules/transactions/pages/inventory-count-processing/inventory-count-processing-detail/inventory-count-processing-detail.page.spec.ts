import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryCountProcessingDetailPage } from './inventory-count-processing-detail.page';

describe('InventoryCountProcessingDetailPage', () => {
  let component: InventoryCountProcessingDetailPage;
  let fixture: ComponentFixture<InventoryCountProcessingDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(InventoryCountProcessingDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
