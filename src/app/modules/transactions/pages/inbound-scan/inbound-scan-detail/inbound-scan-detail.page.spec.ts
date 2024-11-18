import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InboundScanDetailPage } from './inbound-scan-detail.page';

describe('InboundScanDetailPage', () => {
  let component: InboundScanDetailPage;
  let fixture: ComponentFixture<InboundScanDetailPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(InboundScanDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
