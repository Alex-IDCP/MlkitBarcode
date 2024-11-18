import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferBinPage } from './transfer-bin.page';

describe('TransferBinPage', () => {
  let component: TransferBinPage;
  let fixture: ComponentFixture<TransferBinPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferBinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
