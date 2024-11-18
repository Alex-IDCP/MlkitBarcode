import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RpInventoryLevelPageRoutingModule } from './rp-inventory-level-routing.module';

import { RpInventoryLevelPage } from './rp-inventory-level.page';
import { SearchMultiDropdownPageModule } from 'src/app/shared/pages/search-multi-dropdown/search-multi-dropdown.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      RpInventoryLevelPageRoutingModule,
      SearchMultiDropdownPageModule
   ],
   declarations: [RpInventoryLevelPage]
})
export class RpInventoryLevelPageModule { }
