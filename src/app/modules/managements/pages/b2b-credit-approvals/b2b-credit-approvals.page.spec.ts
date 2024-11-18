import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { B2bCreditApprovalsPage } from './b2b-credit-approvals.page';

describe('B2bCreditApprovalsPage', () => {
  let component: B2bCreditApprovalsPage;
  let fixture: ComponentFixture<B2bCreditApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(B2bCreditApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
