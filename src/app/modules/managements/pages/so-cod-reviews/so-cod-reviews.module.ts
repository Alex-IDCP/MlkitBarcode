import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SoCodReviewsPageRoutingModule } from './so-cod-reviews-routing.module';

import { SoCodReviewsPage } from './so-cod-reviews.page';
import { TransactionProcessingPage } from 'src/app/shared/pages/transaction-processing/transaction-processing.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SoCodReviewsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [SoCodReviewsPage]
})
export class SoCodReviewsPageModule {}
