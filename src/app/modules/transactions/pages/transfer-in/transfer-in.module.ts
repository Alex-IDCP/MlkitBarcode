import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferInPageRoutingModule } from './transfer-in-routing.module';

import { TransferInPage } from './transfer-in.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferInPageRoutingModule,
    SearchDropdownPageModule,
    IdMappingModule
  ],
  declarations: [TransferInPage]
})
export class TransferInPageModule {}
