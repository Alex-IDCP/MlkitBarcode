import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SalesCartPage } from './sales-cart.page';

describe('SalesCartPage', () => {
  let component: SalesCartPage;
  let fixture: ComponentFixture<SalesCartPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(SalesCartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
