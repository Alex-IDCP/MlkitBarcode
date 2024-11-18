import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CoTransferOutReviewPageRoutingModule } from './co-transfer-out-reviews-routing.module';

import { CoTransferOutReviewPage } from './co-transfer-out-reviews.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoTransferOutReviewPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [CoTransferOutReviewPage]
})
export class CoTransferOutReviewPageModule {}
