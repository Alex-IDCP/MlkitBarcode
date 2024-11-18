import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferInScanningPageRoutingModule } from './transfer-in-scanning-routing.module';

import { TransferInScanningPage } from './transfer-in-scanning.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferInScanningPageRoutingModule,
    SearchDropdownPageModule,
    IdMappingModule,
    CodeMappingModule
  ],
  declarations: [TransferInScanningPage]
})
export class TransferInScanningPageModule {}
