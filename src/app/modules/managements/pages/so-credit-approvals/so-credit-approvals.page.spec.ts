import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SoCreditApprovalsPage } from './so-credit-approvals.page';

describe('SoCreditApprovalsPage', () => {
  let component: SoCreditApprovalsPage;
  let fixture: ComponentFixture<SoCreditApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(SoCreditApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
