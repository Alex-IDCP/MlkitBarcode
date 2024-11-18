import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DefectRequestDetailPage } from './defect-request-detail.page';

describe('DefectRequestDetailPage', () => {
  let component: DefectRequestDetailPage;
  let fixture: ComponentFixture<DefectRequestDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(DefectRequestDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
