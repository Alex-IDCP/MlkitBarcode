import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentCountPageRoutingModule } from './consignment-count-routing.module';

import { ConsignmentCountPage } from './consignment-count.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsignmentCountPageRoutingModule,
    IdMappingModule,
    NgxPaginationModule
  ],
  declarations: [ConsignmentCountPage]
})
export class ConsignmentCountPageModule {}
