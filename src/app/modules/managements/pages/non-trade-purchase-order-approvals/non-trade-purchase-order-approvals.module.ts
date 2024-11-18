import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NonTradePurchaseOrderApprovalsPageRoutingModule } from './non-trade-purchase-order-approvals-routing.module';

import { NonTradePurchaseOrderApprovalsPage } from './non-trade-purchase-order-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NonTradePurchaseOrderApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [NonTradePurchaseOrderApprovalsPage]
})
export class NonTradePurchaseOrderApprovalsPageModule {}
