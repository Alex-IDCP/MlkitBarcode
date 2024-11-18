import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MultiCoPaApprovalsPage } from './multi-co-pa-approvals.page';

describe('MultiCoPaApprovalsPage', () => {
  let component: MultiCoPaApprovalsPage;
  let fixture: ComponentFixture<MultiCoPaApprovalsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(MultiCoPaApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
