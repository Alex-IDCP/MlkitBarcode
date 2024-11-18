import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NonTradePurchaseOrderReviewsPageRoutingModule } from './non-trade-purchase-order-reviews-routing.module';

import { NonTradePurchaseOrderReviewsPage } from './non-trade-purchase-order-reviews.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NonTradePurchaseOrderReviewsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [NonTradePurchaseOrderReviewsPage]
})
export class NonTradePurchaseOrderReviewsPageModule {}
