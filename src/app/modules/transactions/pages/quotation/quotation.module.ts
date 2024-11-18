import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationPageRoutingModule } from './quotation-routing.module';

import { QuotationPage } from './quotation.page';
import { ListingSkeletonPageModule } from 'src/app/shared/pages/listing-skeleton/listing-skeleton.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationPageRoutingModule,
    ListingSkeletonPageModule
  ],
  declarations: [QuotationPage]
})
export class QuotationPageModule {}
