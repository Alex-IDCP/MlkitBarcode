import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SoCreditApprovalsPageRoutingModule } from './so-credit-approvals-routing.module';

import { SoCreditApprovalsPage } from './so-credit-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SoCreditApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [SoCreditApprovalsPage]
})
export class SoCreditApprovalsPageModule {}
