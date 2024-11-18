import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CreditorApplicationPage } from './creditor-application.page';

describe('CreditorApplicationPage', () => {
  let component: CreditorApplicationPage;
  let fixture: ComponentFixture<CreditorApplicationPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(CreditorApplicationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
