import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DefectRequestHeaderPage } from './defect-request-header.page';

describe('DefectRequestHeaderPage', () => {
  let component: DefectRequestHeaderPage;
  let fixture: ComponentFixture<DefectRequestHeaderPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(DefectRequestHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
