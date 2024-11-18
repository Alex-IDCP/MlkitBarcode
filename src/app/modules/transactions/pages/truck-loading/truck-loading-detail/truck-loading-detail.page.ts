import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { TruckLoadingRoot } from '../../../models/truck-loading';
import { TruckLoadingService } from '../../../services/truck-loading.service';

@Component({
   selector: 'app-truck-loading-detail',
   templateUrl: './truck-loading-detail.page.html',
   styleUrls: ['./truck-loading-detail.page.scss'],
})
export class TruckLoadingDetailPage implements OnInit {

   objectId: number;
   object: TruckLoadingRoot;

   constructor(
      private route: ActivatedRoute,
      private navController: NavController,
      private modalController: ModalController,
      private toastService: ToastService,
      public objectService: TruckLoadingService
   ) {
      this.route.queryParams.subscribe(params => {
         this.objectId = params["objectId"];
         if (!this.objectId) {
            this.navController.navigateBack("/transactions/truck-loading");
         }
      })
   }

   ngOnInit() {
      if (!this.objectId) {
         this.navController.navigateBack("/transactions/truck-loading")
      } else {
         this.loadDetail();
      }
   }

   loadDetail() {
      try {
         this.objectService.getObject(this.objectId).subscribe(response => {
            this.object = response;
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

}
