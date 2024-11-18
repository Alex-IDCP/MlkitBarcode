import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PalletAssemblyItemPage } from './pallet-assembly-item.page';

describe('PalletAssemblyItemPage', () => {
  let component: PalletAssemblyItemPage;
  let fixture: ComponentFixture<PalletAssemblyItemPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(PalletAssemblyItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
