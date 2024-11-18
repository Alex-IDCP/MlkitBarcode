import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderReviewsPageRoutingModule } from './sales-order-reviews-routing.module';

import { SalesOrderReviewsPage } from './sales-order-reviews.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesOrderReviewsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [SalesOrderReviewsPage]
})
export class SalesOrderReviewsPageModule {}
