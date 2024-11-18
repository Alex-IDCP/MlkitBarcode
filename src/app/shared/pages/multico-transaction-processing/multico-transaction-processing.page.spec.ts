import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MultiCoTransactionProcessingPage } from './multico-transaction-processing.page';

describe('MultiCoTransactionProcessingPage', () => {
  let component: MultiCoTransactionProcessingPage;
  let fixture: ComponentFixture<MultiCoTransactionProcessingPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(MultiCoTransactionProcessingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
