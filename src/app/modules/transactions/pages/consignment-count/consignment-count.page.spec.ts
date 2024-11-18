import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ConsignmentCountPage } from './consignment-count.page';

describe('ConsignmentCountPage', () => {
  let component: ConsignmentCountPage;
  let fixture: ComponentFixture<ConsignmentCountPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(ConsignmentCountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
