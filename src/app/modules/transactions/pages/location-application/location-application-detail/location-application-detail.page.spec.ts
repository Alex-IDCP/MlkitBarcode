import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LocationApplicationDetailPage } from './location-application-detail.page';

describe('LocationApplicationDetailPage', () => {
  let component: LocationApplicationDetailPage;
  let fixture: ComponentFixture<LocationApplicationDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(LocationApplicationDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
