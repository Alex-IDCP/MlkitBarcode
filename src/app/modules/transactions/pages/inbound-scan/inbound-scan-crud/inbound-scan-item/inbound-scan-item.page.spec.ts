import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InboundScanItemPage } from './inbound-scan-item.page';

describe('InboundScanItemPage', () => {
  let component: InboundScanItemPage;
  let fixture: ComponentFixture<InboundScanItemPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(InboundScanItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
