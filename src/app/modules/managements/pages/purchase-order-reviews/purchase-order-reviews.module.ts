import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseOrderReviewsPageRoutingModule } from './purchase-order-reviews-routing.module';

import { PurchaseOrderReviewsPage } from './purchase-order-reviews.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchaseOrderReviewsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [PurchaseOrderReviewsPage]
})
export class PurchaseOrderReviewsPageModule {}
