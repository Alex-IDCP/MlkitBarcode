import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DoAcknowledgementPage } from './do-acknowledgement.page';

describe('DoAcknowledgementPage', () => {
  let component: DoAcknowledgementPage;
  let fixture: ComponentFixture<DoAcknowledgementPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(DoAcknowledgementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
