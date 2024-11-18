import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PalletAssemblyPage } from './pallet-assembly.page';

describe('PalletAssemblyPage', () => {
  let component: PalletAssemblyPage;
  let fixture: ComponentFixture<PalletAssemblyPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(PalletAssemblyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
