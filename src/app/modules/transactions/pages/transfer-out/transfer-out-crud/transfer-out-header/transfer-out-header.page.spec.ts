import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferOutHeaderPage } from './transfer-out-header.page';

describe('TransferOutHeaderPage', () => {
  let component: TransferOutHeaderPage;
  let fixture: ComponentFixture<TransferOutHeaderPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferOutHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
