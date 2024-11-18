import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DefectRequestReviewsPage } from './defect-request-reviews.page';

describe('DefectRequestReviewsPage', () => {
  let component: DefectRequestReviewsPage;
  let fixture: ComponentFixture<DefectRequestReviewsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(DefectRequestReviewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
