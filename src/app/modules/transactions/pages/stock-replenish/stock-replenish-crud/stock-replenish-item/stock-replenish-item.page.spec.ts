import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StockReplenishItemPage } from './stock-replenish-item.page';

describe('StockReplenishItemPage', () => {
  let component: StockReplenishItemPage;
  let fixture: ComponentFixture<StockReplenishItemPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(StockReplenishItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
