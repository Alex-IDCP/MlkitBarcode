import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockReplenishHeaderPageRoutingModule } from './stock-replenish-header-routing.module';

import { StockReplenishHeaderPage } from './stock-replenish-header.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockReplenishHeaderPageRoutingModule,
    SearchDropdownPageModule
  ],
  declarations: [StockReplenishHeaderPage]
})
export class StockReplenishHeaderPageModule {}
