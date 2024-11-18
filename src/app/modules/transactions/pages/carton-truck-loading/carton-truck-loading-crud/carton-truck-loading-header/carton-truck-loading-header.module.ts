import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CartonTruckLoadingHeaderPageRoutingModule } from './carton-truck-loading-header-routing.module';

import { CartonTruckLoadingHeaderPage } from './carton-truck-loading-header.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';
import { GeneralScanInputPageModule } from 'src/app/shared/pages/general-scan-input/general-scan-input.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      CartonTruckLoadingHeaderPageRoutingModule,
      ReactiveFormsModule,
      SearchDropdownPageModule,
      IdMappingModule,
      CodeMappingModule,
      GeneralScanInputPageModule
   ],
   declarations: [CartonTruckLoadingHeaderPage]
})
export class CartonTruckLoadingHeaderPageModule { }
