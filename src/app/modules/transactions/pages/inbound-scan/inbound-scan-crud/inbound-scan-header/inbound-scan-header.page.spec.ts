import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InboundScanHeaderPage } from './inbound-scan-header.page';

describe('InboundScanHeaderPage', () => {
  let component: InboundScanHeaderPage;
  let fixture: ComponentFixture<InboundScanHeaderPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(InboundScanHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
