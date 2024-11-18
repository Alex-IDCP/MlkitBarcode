import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryAdjReqDetailPage } from './inventory-adj-req-detail.page';

describe('InventoryAdjReqDetailPage', () => {
  let component: InventoryAdjReqDetailPage;
  let fixture: ComponentFixture<InventoryAdjReqDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(InventoryAdjReqDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
