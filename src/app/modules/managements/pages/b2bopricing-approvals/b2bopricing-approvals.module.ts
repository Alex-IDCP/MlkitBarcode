import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { B2bopricingApprovalsPageRoutingModule } from './b2bopricing-approvals-routing.module';

import { B2bopricingApprovalsPage } from './b2bopricing-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    B2bopricingApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [B2bopricingApprovalsPage]
})
export class B2bopricingApprovalsPageModule {}
