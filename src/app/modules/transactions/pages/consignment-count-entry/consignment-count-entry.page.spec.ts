import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ConsignmentCountEntryPage } from './consignment-count-entry.page';

describe('ConsignmentCountEntryPage', () => {
  let component: ConsignmentCountEntryPage;
  let fixture: ComponentFixture<ConsignmentCountEntryPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(ConsignmentCountEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
