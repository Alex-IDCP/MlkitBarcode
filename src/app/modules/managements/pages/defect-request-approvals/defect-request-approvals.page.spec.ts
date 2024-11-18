import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DefectRequestApprovalsPage } from './defect-request-approvals.page';

describe('DefectRequestApprovalsPage', () => {
  let component: DefectRequestApprovalsPage;
  let fixture: ComponentFixture<DefectRequestApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(DefectRequestApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
