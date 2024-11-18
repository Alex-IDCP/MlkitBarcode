import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockReorderHeaderPageRoutingModule } from './stock-reorder-header-routing.module';

import { StockReorderHeaderPage } from './stock-reorder-header.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      StockReorderHeaderPageRoutingModule,
      SearchDropdownPageModule,
      ReactiveFormsModule,
      BarcodeScanInputPageModule,
      CodeMappingModule
   ],
   declarations: [StockReorderHeaderPage]
})
export class StockReorderHeaderPageModule { }
