import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { B2bCreditApprovalsPageRoutingModule } from './b2b-credit-approvals-routing.module';

import { B2bCreditApprovalsPage } from './b2b-credit-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    B2bCreditApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [B2bCreditApprovalsPage]
})
export class B2bCreditApprovalsPageModule {}
