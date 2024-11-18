import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockReorderPageRoutingModule } from './stock-reorder-routing.module';

import { StockReorderPage } from './stock-reorder.page';
import { NgxPaginationModule } from 'ngx-pagination';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      StockReorderPageRoutingModule,
      NgxPaginationModule,
      CodeMappingModule
   ],
   declarations: [StockReorderPage]
})
export class StockReorderPageModule { }
