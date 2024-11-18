import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreditorApplicationAddPageRoutingModule } from './creditor-application-add-routing.module';

import { CreditorApplicationAddPage } from './creditor-application-add.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreditorApplicationAddPageRoutingModule,
    ReactiveFormsModule,
    SearchDropdownPageModule
  ],
  declarations: [CreditorApplicationAddPage]
})
export class CreditorApplicationAddPageModule {}
