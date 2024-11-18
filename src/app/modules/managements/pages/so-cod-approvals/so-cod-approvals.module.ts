import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SoCodApprovalsPageRoutingModule } from './so-cod-approvals-routing.module';

import { SoCodApprovalsPage } from './so-cod-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SoCodApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [SoCodApprovalsPage]
})
export class SoCodApprovalsPageModule {}
