import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecallDepositApprovalsPageRoutingModule } from './recall-deposit-approvals-routing.module';

import { RecallDepositApprovalsPage } from './recall-deposit-approvals.page';
import { PosApprovalProcessingPageModule } from 'src/app/shared/pages/pos-approval-processing/pos-approval-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecallDepositApprovalsPageRoutingModule,
    PosApprovalProcessingPageModule
  ],
  declarations: [RecallDepositApprovalsPage]
})
export class RecallDepositApprovalsPageModule {}
