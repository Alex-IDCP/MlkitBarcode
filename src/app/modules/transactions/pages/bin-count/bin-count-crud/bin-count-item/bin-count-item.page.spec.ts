import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BinCountItemPage } from './bin-count-item.page';

describe('BinCountItemPage', () => {
  let component: BinCountItemPage;
  let fixture: ComponentFixture<BinCountItemPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(BinCountItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
