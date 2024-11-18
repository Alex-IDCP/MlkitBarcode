import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RpCheckCnPageRoutingModule } from './rp-check-cn-routing.module';

import { RpCheckCnPage } from './rp-check-cn.page';
import { SearchMultiDropdownPageModule } from 'src/app/shared/pages/search-multi-dropdown/search-multi-dropdown.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RpCheckCnPageRoutingModule,
    SearchMultiDropdownPageModule,
    NgxDatatableModule
  ],
  declarations: [RpCheckCnPage]
})
export class RpCheckCnPageModule {}
