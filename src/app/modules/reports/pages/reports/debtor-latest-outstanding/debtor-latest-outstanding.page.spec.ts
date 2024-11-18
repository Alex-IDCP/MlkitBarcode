import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DebtorLatestOutstandingPage } from './debtor-latest-outstanding.page';

describe('DebtorLatestOutstandingPage', () => {
  let component: DebtorLatestOutstandingPage;
  let fixture: ComponentFixture<DebtorLatestOutstandingPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DebtorLatestOutstandingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DebtorLatestOutstandingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
