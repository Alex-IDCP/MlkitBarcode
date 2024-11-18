import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickingPageRoutingModule } from './picking-routing.module';

import { PickingPage } from './picking.page';
import { ListingSkeletonPageModule } from 'src/app/shared/pages/listing-skeleton/listing-skeleton.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      PickingPageRoutingModule,
      ListingSkeletonPageModule,
      NgxPaginationModule
   ],
   declarations: [PickingPage]
})
export class PickingPageModule { }
