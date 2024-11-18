import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { B2boReviewsPageRoutingModule } from './b2bo-reviews-routing.module';

import { B2boReviewsPage } from './b2bo-reviews.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    B2boReviewsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [B2boReviewsPage]
})
export class B2boReviewsPageModule {}
