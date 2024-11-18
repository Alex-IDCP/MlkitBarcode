import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderHeaderPageRoutingModule } from './sales-order-header-routing.module';

import { SalesOrderHeaderPage } from './sales-order-header.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SalesOrderHeaderPageRoutingModule,
    IdMappingModule,
    SearchDropdownPageModule
  ],
  declarations: [SalesOrderHeaderPage]
})
export class SalesOrderHeaderPageModule {}
