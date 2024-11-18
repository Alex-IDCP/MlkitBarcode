import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RetailTransferOutReviewPageRoutingModule } from './retail-transfer-out-reviews-routing.module';

import { RetailTransferOutReviewPage } from './retail-transfer-out-reviews.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RetailTransferOutReviewPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [RetailTransferOutReviewPage]
})
export class RetailTransferOutReviewPageModule {}
