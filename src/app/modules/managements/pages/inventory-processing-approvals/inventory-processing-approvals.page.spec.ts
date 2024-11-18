import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryProcessingApprovalsPage } from './inventory-processing-approvals.page';

describe('InventoryProcessingApprovalsPage', () => {
  let component: InventoryProcessingApprovalsPage;
  let fixture: ComponentFixture<InventoryProcessingApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(InventoryProcessingApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
