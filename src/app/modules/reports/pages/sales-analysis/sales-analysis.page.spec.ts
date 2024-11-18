import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SalesAnalysisPage } from './sales-analysis.page';

describe('SalesAnalysisPage', () => {
  let component: SalesAnalysisPage;
  let fixture: ComponentFixture<SalesAnalysisPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(SalesAnalysisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
