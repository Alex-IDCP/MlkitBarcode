import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { B2bCodApprovalsPage } from './b2b-cod-approvals.page';

describe('B2bCodApprovalsPage', () => {
  let component: B2bCodApprovalsPage;
  let fixture: ComponentFixture<B2bCodApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(B2bCodApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
