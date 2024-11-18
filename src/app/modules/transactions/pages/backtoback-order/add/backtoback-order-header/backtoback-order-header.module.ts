import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BacktobackOrderHeaderPageRoutingModule } from './backtoback-order-header-routing.module';

import { BacktobackOrderHeaderPage } from './backtoback-order-header.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BacktobackOrderHeaderPageRoutingModule,
    SearchDropdownPageModule
  ],
  declarations: [BacktobackOrderHeaderPage]
})
export class BacktobackOrderHeaderPageModule {}
