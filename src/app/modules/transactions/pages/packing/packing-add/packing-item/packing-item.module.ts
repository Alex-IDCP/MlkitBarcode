import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PackingItemPageRoutingModule } from './packing-item-routing.module';

import { PackingItemPage } from './packing-item.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { ItemAddListFlatPageModule } from 'src/app/shared/pages/item-add-list-flat/item-add-list-flat.module';
import { CameraScanInputPageModule } from 'src/app/shared/pages/camera-scan-input/camera-scan-input.module';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { OfflineItemIdMappingModule } from 'src/app/shared/pipes/offline-item-id-mapping/offline-item-id-mapping.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { PinchZoomModule } from 'ngx-pinch-zoom';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      PackingItemPageRoutingModule,
      BarcodeScanInputPageModule,
      ItemAddListFlatPageModule,
      NgCircleProgressModule,
      SearchDropdownPageModule,
      IdMappingModule,
      OfflineItemIdMappingModule,
      SumModule,
      PinchZoomModule
   ],
   declarations: [PackingItemPage]
})
export class PackingItemPageModule { }
