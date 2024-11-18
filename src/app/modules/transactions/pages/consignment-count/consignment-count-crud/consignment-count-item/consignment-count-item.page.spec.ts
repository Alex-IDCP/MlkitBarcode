import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ConsignmentCountItemPage } from './consignment-count-item.page';

describe('ConsignmentCountItemPage', () => {
  let component: ConsignmentCountItemPage;
  let fixture: ComponentFixture<ConsignmentCountItemPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(ConsignmentCountItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
