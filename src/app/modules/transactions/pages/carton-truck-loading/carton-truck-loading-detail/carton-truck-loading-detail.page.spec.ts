import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CartonTruckLoadingDetailPage } from './carton-truck-loading-detail.page';

describe('CartonTruckLoadingDetailPage', () => {
  let component: CartonTruckLoadingDetailPage;
  let fixture: ComponentFixture<CartonTruckLoadingDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(CartonTruckLoadingDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
