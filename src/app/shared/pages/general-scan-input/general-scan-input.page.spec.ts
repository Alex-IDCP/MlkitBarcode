import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GeneralScanInputPage } from './general-scan-input.page';

describe('GeneralScanInputPage', () => {
  let component: GeneralScanInputPage;
  let fixture: ComponentFixture<GeneralScanInputPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(GeneralScanInputPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
