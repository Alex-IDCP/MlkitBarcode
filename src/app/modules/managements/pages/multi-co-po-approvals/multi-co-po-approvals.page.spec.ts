import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MultiCoPoApprovalsPage } from './multi-co-po-approvals.page';

describe('MultiCoPoApprovalsPage', () => {
  let component: MultiCoPoApprovalsPage;
  let fixture: ComponentFixture<MultiCoPoApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(MultiCoPoApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
