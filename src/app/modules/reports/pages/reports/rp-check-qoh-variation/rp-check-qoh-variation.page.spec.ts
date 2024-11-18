import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RpCheckQohVariationPage } from './rp-check-qoh-variation.page';

describe('RpCheckQohVariationPage', () => {
  let component: RpCheckQohVariationPage;
  let fixture: ComponentFixture<RpCheckQohVariationPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(RpCheckQohVariationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
