import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ViewWillEnter, ViewDidEnter, ViewDidLeave, ModalController, ActionSheetController, AlertController, NavController } from '@ionic/angular';
import { format } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SalesSearchModal } from 'src/app/shared/models/sales-search-modal';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';
import { Customer } from '../../models/customer';
import { QuotationService } from '../../services/quotation.service';
import { FilterPage } from '../filter/filter.page';
import { CartonTruckLoadingList } from '../../models/carton-truck-loading';
import { CartonTruckLoadingService } from '../../services/carton-truck-loading.service';

@Component({
  selector: 'app-carton-truck-loading',
  templateUrl: './carton-truck-loading.page.html',
  styleUrls: ['./carton-truck-loading.page.scss'],
})
export class CartonTruckLoadingPage implements OnInit, OnDestroy, ViewWillEnter, ViewDidEnter, ViewDidLeave {

   objects: CartonTruckLoadingList[] = [];
   uniqueGrouping: Date[] = [];

   constructor(
      private objectService: CartonTruckLoadingService,
      private authService: AuthService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private modalController: ModalController,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private navController: NavController,
   ) { }

   async ionViewWillEnter(): Promise<void> {
      if (this.objectService.startDate === null || this.objectService.startDate === undefined) {
         this.objectService.startDate = this.commonService.getFirstDayOfTodayMonth();
      }
      if (this.objectService.endDate === null || this.objectService.endDate === undefined) {
         this.objectService.endDate = this.commonService.getTodayDate();
      }
      await this.objectService.loadRequiredMaster();
      await this.loadObjects();
   }

   ionViewDidEnter(): void {

   }

   ionViewDidLeave(): void {
      
   }

   ngOnInit() {

   }

   ngOnDestroy(): void {

   }

   /* #region  crud */

   async loadObjects() {
      try {
         this.objectService.getObjectList(format(this.objectService.startDate, "yyyy-MM-dd"), format(this.objectService.endDate, "yyyy-MM-dd")).subscribe(async response => {
            this.objects = response;
            this.objects = this.commonService.convertArrayAllDateType(this.objects);
            let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
            this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
            await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
         }, async error => {
            await this.loadingService.dismissLoading();
            console.error(error);
         })
      } catch (e) {
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   getObjects(date: Date) {
      return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate());
   }

   /* #endregion */

   /* #region  add quotation */

   async addObject() {
      try {
         this.objectService.resetVariables();
         this.navController.navigateForward("/transactions/carton-truck-loading/carton-truck-loading-header");
      } catch (e) {
         console.error(e);
      }
   }

   async selectAction() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Choose an action",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Add Carton Truck Loading",
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
   async filter() {
      try {
         const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
               startDate: this.objectService.startDate,
               endDate: this.objectService.endDate
            },
            canDismiss: true
         })
         await modal.present();
         let { data } = await modal.onWillDismiss();
         if (data && data !== undefined) {
            this.objectService.startDate = new Date(data.startDate);
            this.objectService.endDate = new Date(data.endDate);
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
         this.navController.navigateForward("/transactions/carton-truck-loading/carton-truck-loading-detail", navigationExtras);
      } catch (e) {
         console.error(e);
      }
   }

}
