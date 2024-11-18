import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BinCountDetailPage } from './bin-count-detail.page';

describe('BinCountDetailPage', () => {
  let component: BinCountDetailPage;
  let fixture: ComponentFixture<BinCountDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(BinCountDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
