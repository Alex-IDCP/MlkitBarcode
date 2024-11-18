import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DefectRequestCartPage } from './defect-request-cart.page';

describe('DefectRequestCartPage', () => {
  let component: DefectRequestCartPage;
  let fixture: ComponentFixture<DefectRequestCartPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(DefectRequestCartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
