import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { B2bCodApprovalsPageRoutingModule } from './b2b-cod-approvals-routing.module';

import { B2bCodApprovalsPage } from './b2b-cod-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    B2bCodApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [B2bCodApprovalsPage]
})
export class B2bCodApprovalsPageModule {}
