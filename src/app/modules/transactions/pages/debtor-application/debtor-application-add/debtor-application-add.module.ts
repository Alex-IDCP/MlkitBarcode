import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DebtorApplicationAddPageRoutingModule } from './debtor-application-add-routing.module';

import { DebtorApplicationAddPage } from './debtor-application-add.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DebtorApplicationAddPageRoutingModule,
    ReactiveFormsModule,
    SearchDropdownPageModule
  ],
  declarations: [DebtorApplicationAddPage]
})
export class DebtorApplicationAddPageModule {}
