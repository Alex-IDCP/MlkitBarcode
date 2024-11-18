import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferInPage } from './transfer-in.page';

describe('TransferInPage', () => {
  let component: TransferInPage;
  let fixture: ComponentFixture<TransferInPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferInPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
