import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SoCodApprovalsPage } from './so-cod-approvals.page';

describe('SoCodApprovalsPage', () => {
  let component: SoCodApprovalsPage;
  let fixture: ComponentFixture<SoCodApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(SoCodApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
