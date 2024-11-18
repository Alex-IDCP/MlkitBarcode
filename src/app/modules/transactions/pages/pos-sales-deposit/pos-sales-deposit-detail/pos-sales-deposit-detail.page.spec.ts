import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PosSalesDepositDetailPage } from './pos-sales-deposit-detail.page';

describe('PosSalesDepositDetailPage', () => {
  let component: PosSalesDepositDetailPage;
  let fixture: ComponentFixture<PosSalesDepositDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(PosSalesDepositDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
