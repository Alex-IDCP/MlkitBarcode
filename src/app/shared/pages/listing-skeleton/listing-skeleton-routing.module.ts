import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListingSkeletonPage } from './listing-skeleton.page';

const routes: Routes = [
  {
    path: '',
    component: ListingSkeletonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListingSkeletonPageRoutingModule {}
