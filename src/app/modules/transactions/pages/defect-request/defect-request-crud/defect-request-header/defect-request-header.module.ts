import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DefectRequestHeaderPageRoutingModule } from './defect-request-header-routing.module';

import { DefectRequestHeaderPage } from './defect-request-header.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      DefectRequestHeaderPageRoutingModule,
      ReactiveFormsModule,
      SearchDropdownPageModule
   ],
   declarations: [DefectRequestHeaderPage]
})
export class DefectRequestHeaderPageModule { }
