import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferInItemPage } from './transfer-in-item.page';

describe('TransferInItemPage', () => {
  let component: TransferInItemPage;
  let fixture: ComponentFixture<TransferInItemPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferInItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
