import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemPageRoutingModule } from './picking-item-routing.module';

import { PickingItemPage } from './picking-item.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { ItemAddListFlatPageModule } from 'src/app/shared/pages/item-add-list-flat/item-add-list-flat.module';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { OfflineItemIdMappingModule } from 'src/app/shared/pipes/offline-item-id-mapping/offline-item-id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { PinchZoomModule } from 'ngx-pinch-zoom';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      ItemPageRoutingModule,
      BarcodeScanInputPageModule,
      ItemAddListFlatPageModule,
      NgCircleProgressModule,
      OfflineItemIdMappingModule,
      SumModule,
      PinchZoomModule
   ],
   declarations: [PickingItemPage]
})
export class PickingItemPageModule { }
