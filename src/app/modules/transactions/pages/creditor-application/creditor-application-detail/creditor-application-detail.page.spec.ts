import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CreditorApplicationDetailPage } from './creditor-application-detail.page';

describe('CreditorApplicationDetailPage', () => {
  let component: CreditorApplicationDetailPage;
  let fixture: ComponentFixture<CreditorApplicationDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(CreditorApplicationDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
