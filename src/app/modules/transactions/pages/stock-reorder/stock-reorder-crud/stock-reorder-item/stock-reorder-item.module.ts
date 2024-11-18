import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockReorderItemPageRoutingModule } from './stock-reorder-item-routing.module';

import { StockReorderItemPage } from './stock-reorder-item.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      StockReorderItemPageRoutingModule,
      BarcodeScanInputPageModule,
   ],
   declarations: [StockReorderItemPage]
})
export class StockReorderItemPageModule { }
