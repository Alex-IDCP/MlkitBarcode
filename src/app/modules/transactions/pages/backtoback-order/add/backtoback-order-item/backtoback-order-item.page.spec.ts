import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BacktobackOrderItemPage } from './backtoback-order-item.page';

describe('BacktobackOrderItemPage', () => {
  let component: BacktobackOrderItemPage;
  let fixture: ComponentFixture<BacktobackOrderItemPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BacktobackOrderItemPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BacktobackOrderItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
