import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { B2bopricingApprovalsPage } from './b2bopricing-approvals.page';

describe('B2bopricingApprovalsPage', () => {
  let component: B2bopricingApprovalsPage;
  let fixture: ComponentFixture<B2bopricingApprovalsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ B2bopricingApprovalsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(B2bopricingApprovalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
