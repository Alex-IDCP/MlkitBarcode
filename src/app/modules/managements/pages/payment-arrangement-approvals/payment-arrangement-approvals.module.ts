import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentArrangementApprovalsPageRoutingModule } from './payment-arrangement-approvals-routing.module';

import { PaymentArrangementApprovalsPage } from './payment-arrangement-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      PaymentArrangementApprovalsPageRoutingModule,
      TransactionProcessingPageModule
   ],
   declarations: [PaymentArrangementApprovalsPage]
})
export class PaymentArrangementApprovalsPageModule { }
