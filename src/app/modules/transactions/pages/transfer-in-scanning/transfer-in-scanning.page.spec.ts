import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferInScanningPage } from './transfer-in-scanning.page';

describe('TransferInScanningPage', () => {
  let component: TransferInScanningPage;
  let fixture: ComponentFixture<TransferInScanningPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferInScanningPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
