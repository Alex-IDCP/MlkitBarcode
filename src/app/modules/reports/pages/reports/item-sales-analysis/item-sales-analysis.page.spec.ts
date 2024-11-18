import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ItemSalesAnalysisPage } from './item-sales-analysis.page';

describe('ItemSalesAnalysisPage', () => {
  let component: ItemSalesAnalysisPage;
  let fixture: ComponentFixture<ItemSalesAnalysisPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(ItemSalesAnalysisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
