import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StockReplenishHeaderPage } from './stock-replenish-header.page';

describe('StockReplenishHeaderPage', () => {
  let component: StockReplenishHeaderPage;
  let fixture: ComponentFixture<StockReplenishHeaderPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(StockReplenishHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
