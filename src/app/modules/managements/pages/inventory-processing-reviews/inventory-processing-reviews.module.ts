import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryProcessingReviewsPageRoutingModule } from './inventory-processing-reviews-routing.module';

import { InventoryProcessingReviewsPage } from './inventory-processing-reviews.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InventoryProcessingReviewsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [InventoryProcessingReviewsPage]
})
export class InventoryProcessingReviewsPageModule {}
