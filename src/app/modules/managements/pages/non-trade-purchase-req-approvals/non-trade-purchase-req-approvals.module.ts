import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NonTradePurchaseReqApprovalsPageRoutingModule } from './non-trade-purchase-req-approvals-routing.module';

import { NonTradePurchaseReqApprovalsPage } from './non-trade-purchase-req-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NonTradePurchaseReqApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [NonTradePurchaseReqApprovalsPage]
})
export class NonTradePurchaseReqApprovalsPageModule {}
