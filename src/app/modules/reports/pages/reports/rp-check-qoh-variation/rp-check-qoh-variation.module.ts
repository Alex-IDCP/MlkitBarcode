import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RpCheckQohVariationPageRoutingModule } from './rp-check-qoh-variation-routing.module';

import { RpCheckQohVariationPage } from './rp-check-qoh-variation.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { SearchMultiDropdownPageModule } from 'src/app/shared/pages/search-multi-dropdown/search-multi-dropdown.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      RpCheckQohVariationPageRoutingModule,
      NgxDatatableModule,
      SearchDropdownPageModule,
      SearchMultiDropdownPageModule
   ],
   declarations: [RpCheckQohVariationPage]
})
export class RpCheckQohVariationPageModule { }
