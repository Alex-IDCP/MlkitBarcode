import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderPageRoutingModule } from './sales-order-routing.module';

import { SalesOrderPage } from './sales-order.page';
import { ListingSkeletonPageModule } from 'src/app/shared/pages/listing-skeleton/listing-skeleton.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      SalesOrderPageRoutingModule,
      ListingSkeletonPageModule,
      NgxPaginationModule
   ],
   declarations: [SalesOrderPage]
})
export class SalesOrderPageModule { }
