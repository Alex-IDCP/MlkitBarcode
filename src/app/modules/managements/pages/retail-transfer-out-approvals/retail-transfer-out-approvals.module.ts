import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RetailTransferOutApprovalsPageRoutingModule } from './retail-transfer-out-approvals-routing.module';

import { RetailTransferOutApprovalsPage } from './retail-transfer-out-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RetailTransferOutApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [RetailTransferOutApprovalsPage]
})
export class RetailTransferOutApprovalsPageModule {}
