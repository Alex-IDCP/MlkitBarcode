import { Component, DoCheck, IterableDiffers, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { FilterPage } from '../filter/filter.page';
import { format } from 'date-fns';
import { ViewWillEnter, ViewDidEnter, ActionSheetController, AlertController, ModalController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransferInScanningList, TransferInScanningRoot } from '../../models/transfer-in-scanning';
import { TransferInScanningService } from '../../services/transfer-in-scanning.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ConfigService } from 'src/app/services/config/config.service';

@Component({
   selector: 'app-transfer-in-scanning',
   templateUrl: './transfer-in-scanning.page.html',
   styleUrls: ['./transfer-in-scanning.page.scss'],
})
export class TransferInScanningPage implements OnInit, ViewWillEnter, ViewDidEnter, DoCheck {

   private objectDiffer: any;
   objects: TransferInScanningList[] = [];
   uniqueGrouping: Date[] = [];

   constructor(
      public objectService: TransferInScanningService,
      private authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private modalController: ModalController,
      private navController: NavController,
      private differs: IterableDiffers
   ) {
      // reload all masterlist whenever user enter listing
      this.objectDiffer = this.differs.find(this.objects).create();
   }

   ngDoCheck(): void {
      const objectChanges = this.objectDiffer.diff(this.objects);
      if (objectChanges) {
         this.bindUniqueGrouping();
      }
   }

   async ionViewWillEnter(): Promise<void> {
      await this.objectService.loadRequiredMaster();
      await this.objectService.resetVariables();
      if (!this.objectService.filterStartDate) {
         this.objectService.filterStartDate = this.commonService.getFirstDayOfTodayMonth();
      }
      if (!this.objectService.filterEndDate) {
         this.objectService.filterEndDate = this.commonService.getTodayDate();
      }
      if (this.configService.selected_location) {
         this.objectService.selectedLocation = this.configService.selected_location;
      }
      this.objectService.selectedTypeCode = null;
      // await this.bindLocationList();
      await this.loadObjects();
   }

   async ionViewDidEnter(): Promise<void> {
      await this.loadPendingList();
   }

   ngOnInit() {

   }

   /* #region pending objects */

   onLocationChanged(event: any) {
      if (event) {
         this.objectService.selectedLocation = event.id;
         this.loadPendingList();
      } else {
         this.objectService.selectedLocation = null;
         this.pendingObject = [];
      }
   }

   pendingObject: TransferInScanningRoot[] = [];
   async loadPendingList() {
      try {
         await this.loadingService.showLoading();
         this.pendingObject = [];
         if (this.objectService.selectedLocation) {
            this.objectService.getPendingList(this.objectService.locationMasterList.find(r => r.id === this.objectService.selectedLocation)?.code).subscribe(async response => {
               this.pendingObject = response;
               await this.loadingService.dismissLoading();
            }, async error => {
               await this.loadingService.dismissLoading();
               console.error(error);
            })
         }
      } catch (error) {
         await this.loadingService.dismissLoading();
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   selectDoc(object: TransferInScanningRoot) {
      let found = this.objectService.fullLocationMasterList.find(r => r.id === object.toLocationId);
      console.log("🚀 ~ TransferInScanningPage ~ selectDoc ~ found:", found)
      if (found) {
         if (found.attribute1 === "C") {
            object.typeCode = "C";
         } else {
            object.typeCode = "T";
         }
      } else {
         object.typeCode = "C";
      }
      this.objectService.setObject(object);
      this.navController.navigateForward("/transactions/transfer-in-scanning/transfer-in-scanning-item");
   }

   /* #endregion */

   /* #region crud */

   async loadObjects() {
      try {
         await this.loadingService.showLoading();
         this.objects = []; // clear list when enter
         this.objectService.getObjectList(format(this.objectService.filterStartDate, "yyyy-MM-dd"), format(this.objectService.filterEndDate, "yyyy-MM-dd")).subscribe(async response => {
            this.objects = response;
            if (this.objectService.selectedTypeCode) {
               this.objects = this.objects.filter(r => r.typeCode === this.objectService.selectedTypeCode);
            }
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
         }, async error => {
            await this.loadingService.dismissLoading();
            console.error(error);
         })
      } catch (error) {
         await this.loadingService.dismissLoading();
         this.toastService.presentToast("", "Error loading object", "top", "danger", 1000);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   getObjects(date: Date) {
      return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate());
   }

   async bindUniqueGrouping() {
      let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
      this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
      await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
   }

   /* #endregion */

   async filter() {
      try {
         const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
               startDate: this.objectService.filterStartDate,
               endDate: this.objectService.filterEndDate,
               typeCodeFilter: true,
               typeCodeList: this.objectService.salesTypeMasterList,
               selectedTypeCode: this.objectService.selectedTypeCode
            },
            canDismiss: true
         })
         await modal.present();
         let { data } = await modal.onWillDismiss();
         if (data && data !== undefined) {
            this.objects = [];
            this.uniqueGrouping = [];
            this.objectService.filterStartDate = new Date(data.startDate);
            this.objectService.filterEndDate = new Date(data.endDate);
            this.objectService.selectedTypeCode = data.selectedTypeCode;
            this.loadObjects();
         }
      } catch (e) {
         console.error(e);
      }
   }

   goToDetail(objectId: number) {
      try {
         let navigationExtras: NavigationExtras = {
            queryParams: {
               objectId: objectId
            }
         }
         this.navController.navigateForward("/transactions/transfer-in-scanning/transfer-in-scanning-detail", navigationExtras);
      } catch (e) {
         console.error(e);
      }
   }

}
