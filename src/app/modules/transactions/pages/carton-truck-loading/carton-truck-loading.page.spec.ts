import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CartonTruckLoadingPage } from './carton-truck-loading.page';

describe('CartonTruckLoadingPage', () => {
  let component: CartonTruckLoadingPage;
  let fixture: ComponentFixture<CartonTruckLoadingPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(CartonTruckLoadingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
