import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BranchReceivingApprovalsPageRoutingModule } from './branch-receiving-approvals-routing.module';

import { BranchReceivingApprovalsPage } from './branch-receiving-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BranchReceivingApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [BranchReceivingApprovalsPage]
})
export class BranchReceivingApprovalsPageModule {}
