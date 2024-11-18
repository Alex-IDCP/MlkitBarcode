import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DefectRequestPage } from './defect-request.page';

describe('DefectRequestPage', () => {
  let component: DefectRequestPage;
  let fixture: ComponentFixture<DefectRequestPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(DefectRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
