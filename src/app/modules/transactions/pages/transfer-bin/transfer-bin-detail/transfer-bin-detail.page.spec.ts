import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferBinDetailPage } from './transfer-bin-detail.page';

describe('TransferBinDetailPage', () => {
  let component: TransferBinDetailPage;
  let fixture: ComponentFixture<TransferBinDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferBinDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
