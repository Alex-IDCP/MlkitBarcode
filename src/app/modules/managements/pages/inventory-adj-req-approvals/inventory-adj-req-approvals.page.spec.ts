import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryAdjReqApprovalsPage } from './inventory-adj-req-approvals.page';

describe('InventoryAdjReqApprovalsPage', () => {
  let component: InventoryAdjReqApprovalsPage;
  let fixture: ComponentFixture<InventoryAdjReqApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(InventoryAdjReqApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
