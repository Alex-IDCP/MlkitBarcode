import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PalletAssemblyDetailPage } from './pallet-assembly-detail.page';

describe('PalletAssemblyDetailPage', () => {
  let component: PalletAssemblyDetailPage;
  let fixture: ComponentFixture<PalletAssemblyDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(PalletAssemblyDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
