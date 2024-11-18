import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { B2bCodReviewsPageRoutingModule } from './b2b-cod-reviews-routing.module';

import { B2bCodReviewsPage } from './b2b-cod-reviews.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    B2bCodReviewsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [B2bCodReviewsPage]
})
export class B2bCodReviewsPageModule {}
