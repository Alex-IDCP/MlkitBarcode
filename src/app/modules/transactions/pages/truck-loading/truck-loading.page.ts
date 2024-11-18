import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, NavController, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { TruckLoadingHeader } from '../../models/truck-loading';
import { TruckLoadingService } from '../../services/truck-loading.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
   selector: 'app-truck-loading',
   templateUrl: './truck-loading.page.html',
   styleUrls: ['./truck-loading.page.scss'],
})
export class TruckLoadingPage implements OnInit, ViewWillEnter {

   objects: TruckLoadingHeader[] = [];

   uniqueGrouping: Date[] = [];

   constructor(
      private authService: AuthService,
      public objectService: TruckLoadingService,
      private commonService: CommonService,
      private toastService: ToastService,
      private actionSheetController: ActionSheetController,
      private navController: NavController
   ) {
      // reload all masterlist whenever user enter listing
      this.objectService.loadRequiredMaster();
   }

   ionViewWillEnter(): void {
      this.loadObjects();
   }

   ngOnInit() {

   }

   loadObjects() {
      try {
         this.objectService.getObjects().subscribe(async response => {
            this.objects = response;
            let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
            this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
            await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
            this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   getObjects(date: Date) {
      return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate());
   }

   /* #region  add object */

   async addObject() {
      this.navController.navigateForward("/transactions/truck-loading/truck-loading-add");
   }

   // Select action
   async selectAction() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Choose an action",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Add Truck Loading",
                  icon: "document-outline",
                  handler: () => {
                     this.addObject();
                  }
               },
               {
                  text: "Cancel",
                  icon: "close",
                  role: "cancel"
               }]
         });
         await actionSheet.present();
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   goToDetail(objectId: number) {
      let navigationExtras: NavigationExtras = {
         queryParams: {
            objectId: objectId
         }
      }
      this.navController.navigateForward("/transactions/truck-loading/truck-loading-detail", navigationExtras);
   }

}
