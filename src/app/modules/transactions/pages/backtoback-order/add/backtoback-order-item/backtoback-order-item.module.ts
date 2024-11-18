import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BacktobackOrderItemPageRoutingModule } from './backtoback-order-item-routing.module';

import { BacktobackOrderItemPage } from './backtoback-order-item.page';
import { ItemCatalogPageModule } from 'src/app/shared/pages/item-catalog/item-catalog.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BacktobackOrderItemPageRoutingModule,
    ItemCatalogPageModule
  ],
  declarations: [BacktobackOrderItemPage]
})
export class BacktobackOrderItemPageModule {}
