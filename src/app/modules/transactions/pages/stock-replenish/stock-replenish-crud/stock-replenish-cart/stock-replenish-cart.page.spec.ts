import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StockReplenishCartPage } from './stock-replenish-cart.page';

describe('StockReplenishCartPage', () => {
  let component: StockReplenishCartPage;
  let fixture: ComponentFixture<StockReplenishCartPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(StockReplenishCartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
