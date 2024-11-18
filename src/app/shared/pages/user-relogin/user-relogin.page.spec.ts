import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UserReloginPage } from './user-relogin.page';

describe('UserReloginPage', () => {
  let component: UserReloginPage;
  let fixture: ComponentFixture<UserReloginPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(UserReloginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
