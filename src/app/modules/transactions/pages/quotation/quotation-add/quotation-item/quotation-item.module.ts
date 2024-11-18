import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationItemPageRoutingModule } from './quotation-item-routing.module';

import { QuotationItemPage } from './quotation-item.page';
import { ListingSkeletonPageModule } from 'src/app/shared/pages/listing-skeleton/listing-skeleton.module';
import { ItemCartPageModule } from 'src/app/shared/pages/item-cart/item-cart.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { ItemCatalogPageModule } from 'src/app/shared/pages/item-catalog/item-catalog.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationItemPageRoutingModule,
    ListingSkeletonPageModule,
    ItemCartPageModule,
    SumModule,
    ItemCatalogPageModule
  ],
  declarations: [QuotationItemPage]
})
export class QuotationItemPageModule {}
