import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferBinHeaderPage } from './transfer-bin-header.page';

describe('TransferBinHeaderPage', () => {
  let component: TransferBinHeaderPage;
  let fixture: ComponentFixture<TransferBinHeaderPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferBinHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
