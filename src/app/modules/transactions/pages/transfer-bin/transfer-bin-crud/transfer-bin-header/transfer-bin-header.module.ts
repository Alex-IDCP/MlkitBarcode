import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferBinHeaderPageRoutingModule } from './transfer-bin-header-routing.module';

import { TransferBinHeaderPage } from './transfer-bin-header.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferBinHeaderPageRoutingModule,
    ReactiveFormsModule,
    SearchDropdownPageModule
  ],
  declarations: [TransferBinHeaderPage]
})
export class TransferBinHeaderPageModule {}
