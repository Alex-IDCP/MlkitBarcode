import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferInScanningItemPage } from './transfer-in-scanning-item.page';

describe('TransferInScanningItemPage', () => {
  let component: TransferInScanningItemPage;
  let fixture: ComponentFixture<TransferInScanningItemPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferInScanningItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
