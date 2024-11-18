import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListingSkeletonPageRoutingModule } from './listing-skeleton-routing.module';

import { ListingSkeletonPage } from './listing-skeleton.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListingSkeletonPageRoutingModule
  ],
  exports: [ListingSkeletonPage],
  declarations: [ListingSkeletonPage]
})
export class ListingSkeletonPageModule {}
