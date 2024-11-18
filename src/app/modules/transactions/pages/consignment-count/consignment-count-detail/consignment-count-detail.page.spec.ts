import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ConsignmentCountDetailPage } from './consignment-count-detail.page';

describe('ConsignmentCountDetailPage', () => {
  let component: ConsignmentCountDetailPage;
  let fixture: ComponentFixture<ConsignmentCountDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(ConsignmentCountDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
