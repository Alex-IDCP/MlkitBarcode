import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CoTransferOutApprovalsPageRoutingModule } from './co-transfer-out-approvals-routing.module';

import { CoTransferOutApprovalsPage } from './co-transfer-out-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoTransferOutApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [CoTransferOutApprovalsPage]
})
export class CoTransferOutApprovalsPageModule {}
