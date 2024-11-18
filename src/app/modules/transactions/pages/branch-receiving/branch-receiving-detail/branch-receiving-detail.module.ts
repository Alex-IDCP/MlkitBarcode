import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BranchReceivingDetailPageRoutingModule } from './branch-receiving-detail-routing.module';

import { BranchReceivingDetailPage } from './branch-receiving-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BranchReceivingDetailPageRoutingModule,
    IdMappingModule,
    SumModule
  ],
  declarations: [BranchReceivingDetailPage]
})
export class BranchReceivingDetailPageModule {}
