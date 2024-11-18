import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BacktobackOrderHeaderPage } from './backtoback-order-header.page';

describe('BacktobackOrderHeaderPage', () => {
  let component: BacktobackOrderHeaderPage;
  let fixture: ComponentFixture<BacktobackOrderHeaderPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BacktobackOrderHeaderPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BacktobackOrderHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
