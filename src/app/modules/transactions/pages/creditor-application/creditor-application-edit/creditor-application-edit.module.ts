import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreditorApplicationEditPageRoutingModule } from './creditor-application-edit-routing.module';

import { CreditorApplicationEditPage } from './creditor-application-edit.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreditorApplicationEditPageRoutingModule,
    ReactiveFormsModule,
    SearchDropdownPageModule
  ],
  declarations: [CreditorApplicationEditPage]
})
export class CreditorApplicationEditPageModule {}
