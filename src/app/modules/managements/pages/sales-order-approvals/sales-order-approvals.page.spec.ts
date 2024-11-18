import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SalesOrderPendingApproval } from './sales-order-approvals.page';

describe('SalesOrderPendingApproval', () => {
  let component: SalesOrderPendingApproval;
  let fixture: ComponentFixture<SalesOrderPendingApproval>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesOrderPendingApproval ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SalesOrderPendingApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
