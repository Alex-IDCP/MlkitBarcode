import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemSalesAnalysisPageRoutingModule } from './item-sales-analysis-routing.module';

import { ItemSalesAnalysisPage } from './item-sales-analysis.page';
import { SearchMultiDropdownPageModule } from '../../../../../shared/pages/search-multi-dropdown/search-multi-dropdown.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      ItemSalesAnalysisPageRoutingModule,
      SearchMultiDropdownPageModule,
      NgxDatatableModule
   ],
   declarations: [ItemSalesAnalysisPage]
})
export class ItemSalesAnalysisPageModule { }
