import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferOutItemPage } from './transfer-out-item.page';

describe('TransferOutItemPage', () => {
  let component: TransferOutItemPage;
  let fixture: ComponentFixture<TransferOutItemPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferOutItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
