import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NonTradePurchaseReqReviewsPageRoutingModule } from './non-trade-purchase-req-reviews-routing.module';

import { NonTradePurchaseReqReviewsPage } from './non-trade-purchase-req-reviews.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NonTradePurchaseReqReviewsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [NonTradePurchaseReqReviewsPage]
})
export class NonTradePurchaseReqReviewsPageModule {}
