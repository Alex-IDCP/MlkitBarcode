import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StockReorderItemPage } from './stock-reorder-item.page';

describe('StockReorderItemPage', () => {
  let component: StockReorderItemPage;
  let fixture: ComponentFixture<StockReorderItemPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(StockReorderItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
