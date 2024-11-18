import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PricingApprovalsPageRoutingModule } from './pricing-approvals-routing.module';

import { PricingApprovalsPage } from './pricing-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PricingApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [PricingApprovalsPage]
})
export class PricingApprovalsPageModule {}
