import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentCountEntryItemPageRoutingModule } from './consignment-count-entry-item-routing.module';

import { ConsignmentCountEntryItemPage } from './consignment-count-entry-item.page';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { ItemCodeInputPageModule } from 'src/app/shared/pages/item-code-input/item-code-input.module';
import { IdToCodeMappingModule } from 'src/app/shared/pipes/id-to-code-mapping/id-to-code-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      ConsignmentCountEntryItemPageRoutingModule,
      SumModule,
      NgxPaginationModule,
      IdMappingModule,
      IdToCodeMappingModule,
      ItemCodeInputPageModule
   ],
   declarations: [ConsignmentCountEntryItemPage]
})
export class ConsignmentCountEntryItemPageModule { }
