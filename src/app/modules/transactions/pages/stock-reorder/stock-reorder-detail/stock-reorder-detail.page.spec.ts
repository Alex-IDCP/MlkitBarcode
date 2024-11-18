import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StockReorderDetailPage } from './stock-reorder-detail.page';

describe('StockReorderDetailPage', () => {
  let component: StockReorderDetailPage;
  let fixture: ComponentFixture<StockReorderDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(StockReorderDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
