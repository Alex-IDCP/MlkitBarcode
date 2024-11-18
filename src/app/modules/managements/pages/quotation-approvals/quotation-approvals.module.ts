import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationApprovalsPageRoutingModule } from './quotation-approvals-routing.module';

import { QuotationApprovalsPage } from './quotation-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [QuotationApprovalsPage]
})
export class QuotationApprovalsPageModule {}
