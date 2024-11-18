import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemCatalogPageRoutingModule } from './item-catalog-routing.module';

import { ItemCatalogPage } from './item-catalog.page';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';
import { PinchZoomModule } from 'ngx-pinch-zoom';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      ItemCatalogPageRoutingModule,
      IdMappingModule,
      PinchZoomModule
   ],
   exports: [
      ItemCatalogPage
   ],
   declarations: [ItemCatalogPage]
})
export class ItemCatalogPageModule { }
