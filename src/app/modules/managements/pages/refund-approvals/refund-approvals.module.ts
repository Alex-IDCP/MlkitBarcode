import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RefundApprovalsPageRoutingModule } from './refund-approvals-routing.module';

import { RefundApprovalsPage } from './refund-approvals.page';
import { PosApprovalProcessingPageModule } from 'src/app/shared/pages/pos-approval-processing/pos-approval-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RefundApprovalsPageRoutingModule,
    PosApprovalProcessingPageModule
  ],
  declarations: [RefundApprovalsPage]
})
export class RefundApprovalsPageModule {}
