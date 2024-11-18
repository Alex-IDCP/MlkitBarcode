import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ConsignmentCountEntryDetailPage } from './consignment-count-entry-detail.page';

describe('ConsignmentCountEntryDetailPage', () => {
  let component: ConsignmentCountEntryDetailPage;
  let fixture: ComponentFixture<ConsignmentCountEntryDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(ConsignmentCountEntryDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
