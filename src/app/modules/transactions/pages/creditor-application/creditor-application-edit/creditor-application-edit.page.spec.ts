import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CreditorApplicationEditPage } from './creditor-application-edit.page';

describe('CreditorApplicationEditPage', () => {
  let component: CreditorApplicationEditPage;
  let fixture: ComponentFixture<CreditorApplicationEditPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(CreditorApplicationEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
