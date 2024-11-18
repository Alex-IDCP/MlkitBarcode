import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ItemSalesHistoryPage } from './item-sales-history.page';

describe('ItemSalesHistoryPage', () => {
  let component: ItemSalesHistoryPage;
  let fixture: ComponentFixture<ItemSalesHistoryPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(ItemSalesHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
