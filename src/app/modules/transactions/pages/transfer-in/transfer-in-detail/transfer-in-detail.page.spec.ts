import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferInDetailPage } from './transfer-in-detail.page';

describe('TransferInDetailPage', () => {
  let component: TransferInDetailPage;
  let fixture: ComponentFixture<TransferInDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferInDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
