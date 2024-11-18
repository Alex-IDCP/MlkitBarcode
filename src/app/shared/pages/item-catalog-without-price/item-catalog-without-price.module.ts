import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemCatalogWithoutPricePageRoutingModule } from './item-catalog-without-price-routing.module';

import { ItemCatalogWithoutPricePage } from './item-catalog-without-price.page';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemCatalogWithoutPricePageRoutingModule,
    IdMappingModule
  ],
  exports:[
    ItemCatalogWithoutPricePage
  ],
  declarations: [ItemCatalogWithoutPricePage]
})
export class ItemCatalogWithoutPricePageModule {}
