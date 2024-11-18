import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferOutPage } from './transfer-out.page';

describe('TransferOutPage', () => {
  let component: TransferOutPage;
  let fixture: ComponentFixture<TransferOutPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferOutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
