import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferBinItemPageRoutingModule } from './transfer-bin-item-routing.module';

import { TransferBinItemPage } from './transfer-bin-item.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { GeneralScanInputPageModule } from 'src/app/shared/pages/general-scan-input/general-scan-input.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      TransferBinItemPageRoutingModule,
      BarcodeScanInputPageModule,
      SearchDropdownPageModule,
      GeneralScanInputPageModule
   ],
   declarations: [TransferBinItemPage]
})
export class TransferBinItemPageModule { }
