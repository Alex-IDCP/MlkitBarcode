import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BinCountPage } from './bin-count.page';

describe('BinCountPage', () => {
  let component: BinCountPage;
  let fixture: ComponentFixture<BinCountPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(BinCountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
