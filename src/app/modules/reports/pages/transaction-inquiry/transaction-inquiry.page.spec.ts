import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransactionInquiryPage } from './transaction-inquiry.page';

describe('TransactionInquiryPage', () => {
  let component: TransactionInquiryPage;
  let fixture: ComponentFixture<TransactionInquiryPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransactionInquiryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
