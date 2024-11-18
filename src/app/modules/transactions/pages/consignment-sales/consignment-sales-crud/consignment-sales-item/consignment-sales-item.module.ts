import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentSalesItemPageRoutingModule } from './consignment-sales-item-routing.module';

import { ConsignmentSalesItemPage } from './consignment-sales-item.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { ItemAddListFlatPageModule } from 'src/app/shared/pages/item-add-list-flat/item-add-list-flat.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      ConsignmentSalesItemPageRoutingModule,
      BarcodeScanInputPageModule,
      ItemAddListFlatPageModule,
      IdMappingModule,
      SumModule,
      SearchDropdownPageModule,
      NgxPaginationModule
   ],
   declarations: [ConsignmentSalesItemPage]
})
export class ConsignmentSalesItemPageModule { }
