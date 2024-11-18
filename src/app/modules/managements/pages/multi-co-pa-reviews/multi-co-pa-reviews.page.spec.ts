import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MultiCoPaReviewsPage } from './multi-co-pa-reviews.page';

describe('MultiCoPaReviewsPage', () => {
  let component: MultiCoPaReviewsPage;
  let fixture: ComponentFixture<MultiCoPaReviewsPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(MultiCoPaReviewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
