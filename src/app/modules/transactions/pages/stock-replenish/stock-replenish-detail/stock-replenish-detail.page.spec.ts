import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StockReplenishDetailPage } from './stock-replenish-detail.page';

describe('StockReplenishDetailPage', () => {
  let component: StockReplenishDetailPage;
  let fixture: ComponentFixture<StockReplenishDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(StockReplenishDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
