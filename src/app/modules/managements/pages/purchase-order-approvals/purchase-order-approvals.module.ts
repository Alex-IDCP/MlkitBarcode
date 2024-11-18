import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseOrderApprovalsPageRoutingModule } from './purchase-order-approvals-routing.module';

import { PurchaseOrderApprovalsPage } from './purchase-order-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchaseOrderApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [PurchaseOrderApprovalsPage]
})
export class PurchaseOrderApprovalsPageModule {}
