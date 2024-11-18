import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemCartPageRoutingModule } from './item-cart-routing.module';

import { ItemCartPage } from './item-cart.page';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemCartPageRoutingModule,
    IdMappingModule
  ],
  exports: [
    ItemCartPage
  ],
  declarations: [ItemCartPage]
})
export class ItemCartPageModule { }
