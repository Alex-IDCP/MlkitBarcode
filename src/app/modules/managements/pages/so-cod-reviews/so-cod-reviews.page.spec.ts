import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SoCodReviewsPage } from './so-cod-reviews.page';

describe('SoCodReviewsPage', () => {
  let component: SoCodReviewsPage;
  let fixture: ComponentFixture<SoCodReviewsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(SoCodReviewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
