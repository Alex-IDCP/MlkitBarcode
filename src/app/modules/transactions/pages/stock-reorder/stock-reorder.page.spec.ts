import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StockReorderPage } from './stock-reorder.page';

describe('StockReorderPage', () => {
  let component: StockReorderPage;
  let fixture: ComponentFixture<StockReorderPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(StockReorderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
