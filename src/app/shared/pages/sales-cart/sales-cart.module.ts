import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesCartPageRoutingModule } from './sales-cart-routing.module';

import { SalesCartPage } from './sales-cart.page';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';
import { OfflineItemIdMappingModule } from '../../pipes/offline-item-id-mapping/offline-item-id-mapping.module';
import { OfflineItemIdDescMappingModule } from '../../pipes/offline-item-id-desc-mapping/offline-item-id-desc-mapping.module';
import { IdToCodeMappingModule } from '../../pipes/id-to-code-mapping/id-to-code-mapping.module';
import { CodeMappingModule } from '../../pipes/code-mapping/code-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      SalesCartPageRoutingModule,
      IdMappingModule,
      IdToCodeMappingModule,
      CodeMappingModule,
      OfflineItemIdMappingModule,
      OfflineItemIdDescMappingModule
   ],
   exports: [SalesCartPage],
   declarations: [SalesCartPage]
})
export class SalesCartPageModule { }
