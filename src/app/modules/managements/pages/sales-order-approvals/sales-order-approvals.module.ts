import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderApprovalsPageRoutingModule } from './sales-order-approvals-routing.module';

import { SalesOrderPendingApproval } from './sales-order-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesOrderApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [SalesOrderPendingApproval]
})
export class SalesOrderApprovalsPageModule {}
