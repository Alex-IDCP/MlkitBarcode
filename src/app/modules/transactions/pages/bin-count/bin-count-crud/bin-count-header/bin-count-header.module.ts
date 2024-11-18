import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BinCountHeaderPageRoutingModule } from './bin-count-header-routing.module';

import { BinCountHeaderPage } from './bin-count-header.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BinCountHeaderPageRoutingModule,
    IdMappingModule,
    SumModule,
    SearchDropdownPageModule
  ],
  declarations: [BinCountHeaderPage]
})
export class BinCountHeaderPageModule {}
