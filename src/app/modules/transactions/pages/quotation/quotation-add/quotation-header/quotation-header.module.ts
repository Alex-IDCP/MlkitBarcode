import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationHeaderPageRoutingModule } from './quotation-header-routing.module';

import { QuotationHeaderPage } from './quotation-header.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationHeaderPageRoutingModule,
    SearchDropdownPageModule
  ],
  declarations: [QuotationHeaderPage]
})
export class QuotationHeaderPageModule {}
