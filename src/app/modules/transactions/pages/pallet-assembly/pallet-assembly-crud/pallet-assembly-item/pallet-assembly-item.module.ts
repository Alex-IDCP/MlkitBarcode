import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PalletAssemblyItemPageRoutingModule } from './pallet-assembly-item-routing.module';

import { PalletAssemblyItemPage } from './pallet-assembly-item.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PalletAssemblyItemPageRoutingModule,
    SearchDropdownPageModule,
    BarcodeScanInputPageModule
  ],
  declarations: [PalletAssemblyItemPage]
})
export class PalletAssemblyItemPageModule {}
