import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LocationApplicationPage } from './location-application.page';

describe('LocationApplicationPage', () => {
  let component: LocationApplicationPage;
  let fixture: ComponentFixture<LocationApplicationPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(LocationApplicationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
