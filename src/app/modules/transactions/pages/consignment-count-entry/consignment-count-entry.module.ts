import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentCountEntryPageRoutingModule } from './consignment-count-entry-routing.module';

import { ConsignmentCountEntryPage } from './consignment-count-entry.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      ConsignmentCountEntryPageRoutingModule,
      IdMappingModule,
      NgxPaginationModule
   ],
   declarations: [ConsignmentCountEntryPage]
})
export class ConsignmentCountEntryPageModule { }
