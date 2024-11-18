import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentCountEntryHeaderPageRoutingModule } from './consignment-count-entry-header-routing.module';

import { ConsignmentCountEntryHeaderPage } from './consignment-count-entry-header.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      ConsignmentCountEntryHeaderPageRoutingModule,
      ReactiveFormsModule,
      SearchDropdownPageModule
   ],
   declarations: [ConsignmentCountEntryHeaderPage]
})
export class ConsignmentCountEntryHeaderPageModule { }
