import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MultiCoPaReviewsPageRoutingModule } from './multi-co-pa-reviews-routing.module';

import { MultiCoPaReviewsPage } from './multi-co-pa-reviews.page';
import { MultiCoTransactionProcessingPageModule } from 'src/app/shared/pages/multico-transaction-processing/multico-transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MultiCoPaReviewsPageRoutingModule,
    MultiCoTransactionProcessingPageModule
  ],
  declarations: [MultiCoPaReviewsPage]
})
export class MultiCoPaReviewsPageModule {}
