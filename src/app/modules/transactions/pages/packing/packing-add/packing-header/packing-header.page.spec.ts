import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PackingHeaderPage } from './packing-header.page';

describe('PackingHeaderPage', () => {
  let component: PackingHeaderPage;
  let fixture: ComponentFixture<PackingHeaderPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(PackingHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
