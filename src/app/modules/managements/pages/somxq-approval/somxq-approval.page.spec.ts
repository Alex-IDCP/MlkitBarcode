import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SomxqApprovalPage } from './somxq-approval.page';

describe('SomxqApprovalPage', () => {
  let component: SomxqApprovalPage;
  let fixture: ComponentFixture<SomxqApprovalPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(SomxqApprovalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
