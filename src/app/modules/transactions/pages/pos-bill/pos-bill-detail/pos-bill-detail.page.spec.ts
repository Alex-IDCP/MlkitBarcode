import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PosBillDetailPage } from './pos-bill-detail.page';

describe('PosBillDetailPage', () => {
  let component: PosBillDetailPage;
  let fixture: ComponentFixture<PosBillDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(PosBillDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
