import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentCountAnalysisPageRoutingModule } from './consignment-count-analysis-routing.module';

import { ConsignmentCountAnalysisPage } from './consignment-count-analysis.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { SearchMultiDropdownPageModule } from 'src/app/shared/pages/search-multi-dropdown/search-multi-dropdown.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      ConsignmentCountAnalysisPageRoutingModule,
      NgxDatatableModule,
      SearchDropdownPageModule,
      SearchMultiDropdownPageModule,
      SumModule
   ],
   declarations: [ConsignmentCountAnalysisPage]
})
export class ConsignmentCountAnalysisPageModule { }
