import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DebtorApplicationDetailPageRoutingModule } from './debtor-application-detail-routing.module';

import { DebtorApplicationDetailPage } from './debtor-application-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DebtorApplicationDetailPageRoutingModule,
    IdMappingModule
  ],
  declarations: [DebtorApplicationDetailPage]
})
export class DebtorApplicationDetailPageModule {}
