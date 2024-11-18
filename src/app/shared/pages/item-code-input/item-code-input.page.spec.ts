import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ItemCodeInputPage } from './item-code-input.page';

describe('ItemCodeInputPage', () => {
  let component: ItemCodeInputPage;
  let fixture: ComponentFixture<ItemCodeInputPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(ItemCodeInputPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
