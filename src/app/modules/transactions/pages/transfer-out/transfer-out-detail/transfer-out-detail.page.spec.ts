import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferOutDetailPage } from './transfer-out-detail.page';

describe('TransferOutDetailPage', () => {
  let component: TransferOutDetailPage;
  let fixture: ComponentFixture<TransferOutDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferOutDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
