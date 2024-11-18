import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentCountItemPageRoutingModule } from './consignment-count-item-routing.module';

import { ConsignmentCountItemPage } from './consignment-count-item.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { CameraScanInputPageModule } from 'src/app/shared/pages/camera-scan-input/camera-scan-input.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsignmentCountItemPageRoutingModule,
    IdMappingModule,
    BarcodeScanInputPageModule,
    CameraScanInputPageModule,
    SumModule,
    NgxPaginationModule
  ],
  declarations: [ConsignmentCountItemPage]
})
export class ConsignmentCountItemPageModule {}
