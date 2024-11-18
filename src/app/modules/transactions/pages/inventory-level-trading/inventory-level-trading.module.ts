import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryLevelTradingPageRoutingModule } from './inventory-level-trading-routing.module';

import { InventoryLevelTradingPage } from './inventory-level-trading.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      InventoryLevelTradingPageRoutingModule,
      SearchDropdownPageModule,
      IdMappingModule,
      BarcodeScanInputPageModule
   ],
   declarations: [InventoryLevelTradingPage]
})
export class InventoryLevelTradingPageModule { }
