import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationReviewsPageRoutingModule } from './quotation-reviews-routing.module';

import { QuotationReviewsPage } from './quotation-reviews.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationReviewsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [QuotationReviewsPage]
})
export class QuotationReviewsPageModule {}
