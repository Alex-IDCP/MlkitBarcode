import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ExchangeApprovalsPage } from './exchange-approvals.page';

describe('ExchangeApprovalsPage', () => {
  let component: ExchangeApprovalsPage;
  let fixture: ComponentFixture<ExchangeApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(ExchangeApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
