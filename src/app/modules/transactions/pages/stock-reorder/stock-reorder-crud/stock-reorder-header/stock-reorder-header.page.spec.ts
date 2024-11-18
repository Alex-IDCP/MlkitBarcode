import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StockReorderHeaderPage } from './stock-reorder-header.page';

describe('StockReorderInsertPage', () => {
  let component: StockReorderHeaderPage;
  let fixture: ComponentFixture<StockReorderHeaderPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(StockReorderHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
