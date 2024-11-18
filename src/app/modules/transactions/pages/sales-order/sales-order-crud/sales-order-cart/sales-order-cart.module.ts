import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderCartPageRoutingModule } from './sales-order-cart-routing.module';

import { SalesOrderCartPage } from './sales-order-cart.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { OfflineItemIdMappingModule } from 'src/app/shared/pipes/offline-item-id-mapping/offline-item-id-mapping.module';
import { OfflineItemIdDescMappingModule } from 'src/app/shared/pipes/offline-item-id-desc-mapping/offline-item-id-desc-mapping.module';
import { SalesCartPageModule } from 'src/app/shared/pages/sales-cart/sales-cart.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { UserDefinedCaptionModule } from 'src/app/shared/pipes/user-defined-caption/user-defined-caption.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      SalesOrderCartPageRoutingModule,
      IdMappingModule,
      SumModule,
      OfflineItemIdMappingModule,
      OfflineItemIdDescMappingModule,
      SalesCartPageModule,
      SearchDropdownPageModule,
      UserDefinedCaptionModule
   ],
   declarations: [SalesOrderCartPage]
})
export class SalesOrderCartPageModule { }
