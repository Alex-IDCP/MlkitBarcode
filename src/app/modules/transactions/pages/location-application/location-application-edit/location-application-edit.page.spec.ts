import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LocationApplicationEditPage } from './location-application-edit.page';

describe('LocationApplicationEditPage', () => {
  let component: LocationApplicationEditPage;
  let fixture: ComponentFixture<LocationApplicationEditPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(LocationApplicationEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
