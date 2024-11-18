import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { B2boApprovalsPageRoutingModule } from './b2bo-approvals-routing.module';

import { B2boApprovalsPage } from './b2bo-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    B2boApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [B2boApprovalsPage]
})
export class B2boApprovalsPageModule {}
