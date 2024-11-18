import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { B2bCodReviewsPage } from './b2b-cod-reviews.page';

describe('B2bCodReviewsPage', () => {
  let component: B2bCodReviewsPage;
  let fixture: ComponentFixture<B2bCodReviewsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(B2bCodReviewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
