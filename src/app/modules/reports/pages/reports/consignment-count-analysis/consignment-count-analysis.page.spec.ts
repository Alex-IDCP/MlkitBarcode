import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ConsignmentCountAnalysisPage } from './consignment-count-analysis.page';

describe('ConsignmentCountAnalysisPage', () => {
  let component: ConsignmentCountAnalysisPage;
  let fixture: ComponentFixture<ConsignmentCountAnalysisPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(ConsignmentCountAnalysisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
