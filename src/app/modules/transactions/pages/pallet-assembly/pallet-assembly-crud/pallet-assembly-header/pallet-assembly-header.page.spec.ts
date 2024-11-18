import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PalletAssemblyHeaderPage } from './pallet-assembly-header.page';

describe('PalletAssemblyHeaderPage', () => {
  let component: PalletAssemblyHeaderPage;
  let fixture: ComponentFixture<PalletAssemblyHeaderPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(PalletAssemblyHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
