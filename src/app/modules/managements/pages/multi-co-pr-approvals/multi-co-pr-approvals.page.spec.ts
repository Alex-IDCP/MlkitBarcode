import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MultiCoPrApprovalsPage } from './multi-co-pr-approvals.page';

describe('MultiCoPrApprovalsPage', () => {
   let component: MultiCoPrApprovalsPage;
   let fixture: ComponentFixture<MultiCoPrApprovalsPage>;

   beforeEach(waitForAsync() => {
      fixture = TestBed.createComponent(MultiCoPrApprovalsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
