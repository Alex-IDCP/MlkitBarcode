import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferBinItemPage } from './transfer-bin-item.page';

describe('TransferBinItemPage', () => {
  let component: TransferBinItemPage;
  let fixture: ComponentFixture<TransferBinItemPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferBinItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
