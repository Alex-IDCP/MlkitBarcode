import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DefectRequestItemPage } from './defect-request-item.page';

describe('DefectRequestItemPage', () => {
  let component: DefectRequestItemPage;
  let fixture: ComponentFixture<DefectRequestItemPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(DefectRequestItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
