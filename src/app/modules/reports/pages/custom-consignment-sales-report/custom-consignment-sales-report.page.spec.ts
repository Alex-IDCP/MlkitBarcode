import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CustomConsignmentSalesReportPage } from './custom-consignment-sales-report.page';

describe('CustomConsignmentSalesReportPage', () => {
  let component: CustomConsignmentSalesReportPage;
  let fixture: ComponentFixture<CustomConsignmentSalesReportPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(CustomConsignmentSalesReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
