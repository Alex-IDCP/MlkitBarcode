import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RpBoListingPage } from './rp-bo-listing.page';

describe('RpBoListingPage', () => {
  let component: RpBoListingPage;
  let fixture: ComponentFixture<RpBoListingPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(RpBoListingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
