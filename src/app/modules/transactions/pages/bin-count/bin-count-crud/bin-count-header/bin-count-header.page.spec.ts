import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BinCountHeaderPage } from './bin-count-header.page';

describe('BinCountHeaderPage', () => {
  let component: BinCountHeaderPage;
  let fixture: ComponentFixture<BinCountHeaderPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(BinCountHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
