import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseReqApprovalsPageRoutingModule } from './purchase-req-approvals-routing.module';

import { PurchaseReqApprovalsPage } from './purchase-req-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchaseReqApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [PurchaseReqApprovalsPage]
})
export class PurchaseReqApprovalsPageModule {}
