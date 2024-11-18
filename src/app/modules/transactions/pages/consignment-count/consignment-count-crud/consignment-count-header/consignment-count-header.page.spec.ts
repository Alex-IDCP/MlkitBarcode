import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ConsignmentCountHeaderPage } from './consignment-count-header.page';

describe('ConsignmentCountHeaderPage', () => {
  let component: ConsignmentCountHeaderPage;
  let fixture: ComponentFixture<ConsignmentCountHeaderPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(ConsignmentCountHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
