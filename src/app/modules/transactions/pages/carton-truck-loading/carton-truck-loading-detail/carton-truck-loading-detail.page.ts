import { Component, OnInit, ViewChild } from '@angular/core';
import { IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { CartonTruckLoadingService } from '../../../services/carton-truck-loading.service';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CartonInfo } from '../../../models/carton-truck-loading';

@Component({
   selector: 'app-carton-truck-loading-detail',
   templateUrl: './carton-truck-loading-detail.page.html',
   styleUrls: ['./carton-truck-loading-detail.page.scss'],
})
export class CartonTruckLoadingDetailPage implements OnInit, ViewWillEnter {

   objectId: number

   constructor(
      public objectService: CartonTruckLoadingService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private route: ActivatedRoute,
      private navController: NavController,
   ) { }

   ionViewWillEnter(): void {
      this.route.queryParams.subscribe(async params => {
         this.objectId = params["objectId"];
         if (!this.objectId) {
            this.navController.navigateBack("/transactions/carton-truck-loading");
         } else {
            await this.loadObject();
         }
      })
   }

   ngOnInit() {

   }

   async loadObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getObjectById(this.objectId).subscribe(async response => {
            let object = response;
            object.header = this.commonService.convertObjectAllDateType(object.header);
            await this.objectService.setObject(object);
            await this.objectService.setHeader(object.header);
            await this.objectService.setLine(object.details);
            await this.loadingService.dismissLoading();
         }, async error => {
            await this.loadingService.dismissLoading();
            console.error(error);
         })
      } catch (e) {
         await this.loadingService.dismissLoading();
         this.toastService.presentToast("System Error", "Something went wrong", "top", "danger", 1000);
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   /* #region more action popover */

   isPopoverOpen: boolean = false;
   @ViewChild("popover", { static: false }) popoverMenu: IonPopover;
   showPopover(event) {
      try {
         this.popoverMenu.event = event;
         this.isPopoverOpen = true;
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   editObject() {
      this.navController.navigateRoot("/transactions/carton-truck-loading/carton-truck-loading-header");
   }

   toggleObject() {
      this.objectService.toggleObject(this.objectService.objectHeader.cartonTruckLoadingId).subscribe(response => {
         if (response.status === 204) {
            this.loadObject();
            this.toastService.presentToast("", "Update Complete", "top", "success", 1000);
         }
      }, error => {
         console.error(error);
      })
   }

   transformCartonInfo(cartonInfo: CartonInfo[]) {
      if (cartonInfo && cartonInfo.length > 0) {
         let uniquePackaging = cartonInfo.map(x => x.packagingCode);
         let endResult = [];
         uniquePackaging = [...new Set(uniquePackaging)];
         uniquePackaging.forEach(packaging => {
            let transformedCartonInfo = cartonInfo.map(x => {
               let newLine = { cartonNum: x.cartonNum, packagingCode: x.packagingCode }
               return newLine;
            })
            let uniqueCartonInfo = transformedCartonInfo.reduce((accumulator, current) => {
               if (!accumulator.find((item) => item.cartonNum == current.cartonNum && item.packagingCode == current.packagingCode)) {
                  accumulator.push(current);
               }
               return accumulator;
            }, []);
            let packageArray = uniqueCartonInfo.filter(x => x.packagingCode == packaging)
            let newLine = { packagingCode: packaging, qty: packageArray.length }
            endResult.push(newLine);
         })
         return endResult;
      } else {
         return [];
      }
   }

   previousStep() {
      this.objectService.resetVariables();
   }
   
}
