import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ConsignmentCountEntryItemPage } from './consignment-count-entry-item.page';

describe('ConsignmentCountEntryItemPage', () => {
  let component: ConsignmentCountEntryItemPage;
  let fixture: ComponentFixture<ConsignmentCountEntryItemPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(ConsignmentCountEntryItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
