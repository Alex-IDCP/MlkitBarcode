import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ConsignmentCountEntryHeaderPage } from './consignment-count-entry-header.page';

describe('ConsignmentCountEntryHeaderPage', () => {
  let component: ConsignmentCountEntryHeaderPage;
  let fixture: ComponentFixture<ConsignmentCountEntryHeaderPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(ConsignmentCountEntryHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
