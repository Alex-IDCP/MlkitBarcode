import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CartonTruckLoadingHeaderPage } from './carton-truck-loading-header.page';

describe('CartonTruckLoadingHeaderPage', () => {
  let component: CartonTruckLoadingHeaderPage;
  let fixture: ComponentFixture<CartonTruckLoadingHeaderPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(CartonTruckLoadingHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
