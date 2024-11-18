import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CreditorApplicationAddPage } from './creditor-application-add.page';

describe('CreditorApplicationAddPage', () => {
  let component: CreditorApplicationAddPage;
  let fixture: ComponentFixture<CreditorApplicationAddPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(CreditorApplicationAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
