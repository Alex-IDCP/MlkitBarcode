import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseReqReviewsPageRoutingModule } from './purchase-req-reviews-routing.module';

import { PurchaseReqReviewsPage } from './purchase-req-reviews.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchaseReqReviewsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [PurchaseReqReviewsPage]
})
export class PurchaseReqReviewsPageModule {}
