import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RpInventoryLevelPage } from './rp-inventory-level.page';

describe('RpInventoryLevelPage', () => {
  let component: RpInventoryLevelPage;
  let fixture: ComponentFixture<RpInventoryLevelPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(RpInventoryLevelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
