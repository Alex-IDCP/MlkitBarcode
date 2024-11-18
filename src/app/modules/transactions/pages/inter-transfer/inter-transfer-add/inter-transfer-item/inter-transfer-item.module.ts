import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InterTransferItemPageRoutingModule } from './inter-transfer-item-routing.module';

import { InterTransferItemPage } from './inter-transfer-item.page';
import { ItemCatalogWithoutPricePageModule } from 'src/app/shared/pages/item-catalog-without-price/item-catalog-without-price.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InterTransferItemPageRoutingModule,
    ItemCatalogWithoutPricePageModule
  ],
  declarations: [InterTransferItemPage]
})
export class InterTransferItemPageModule {}
