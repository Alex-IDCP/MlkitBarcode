import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BinCountItemPageRoutingModule } from './bin-count-item-routing.module';

import { BinCountItemPage } from './bin-count-item.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BinCountItemPageRoutingModule,
    IdMappingModule,
    BarcodeScanInputPageModule,
    NgxPaginationModule,
    SumModule,
    SearchDropdownPageModule
  ],
  declarations: [BinCountItemPage]
})
export class BinCountItemPageModule {}
