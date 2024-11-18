import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferInScanningDetailPage } from './transfer-in-scanning-detail.page';

describe('TransferInScanningDetailPage', () => {
  let component: TransferInScanningDetailPage;
  let fixture: ComponentFixture<TransferInScanningDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferInScanningDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
