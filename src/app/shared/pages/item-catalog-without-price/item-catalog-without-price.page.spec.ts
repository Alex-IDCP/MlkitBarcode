import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ItemCatalogWithoutPricePage } from './item-catalog-without-price.page';

describe('ItemCatalogWithoutPricePage', () => {
  let component: ItemCatalogWithoutPricePage;
  let fixture: ComponentFixture<ItemCatalogWithoutPricePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemCatalogWithoutPricePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemCatalogWithoutPricePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
