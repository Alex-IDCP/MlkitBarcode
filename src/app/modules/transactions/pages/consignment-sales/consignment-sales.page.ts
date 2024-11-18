import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, ModalController, NavController, ViewDidEnter, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { format } from 'date-fns';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ConsignmentSalesList } from '../../models/consignment-sales';
import { ConsignmentSalesService } from '../../services/consignment-sales.service';
import { FilterPage } from '../filter/filter.page';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

@Component({
   selector: 'app-consignment-sales',
   templateUrl: './consignment-sales.page.html',
   styleUrls: ['./consignment-sales.page.scss'],
})
export class ConsignmentSalesPage implements OnInit, OnDestroy, ViewWillEnter, ViewDidEnter, ViewDidLeave {

   objects: ConsignmentSalesList[] = [];

   uniqueGrouping: Date[] = [];
   currentPage: number = 1;
   itemsPerPage: number = 20;

   constructor(
      private objectService: ConsignmentSalesService,
      public authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private alertController: AlertController,
      private actionSheetController: ActionSheetController,
      private modalController: ModalController,
      private navController: NavController
   ) { }

   async ionViewWillEnter(): Promise<void> {
      this.objects = [];
      this.filteredObj = [];
      try {
         if (!this.objectService.filterStartDate) {
            this.objectService.filterStartDate = this.commonService.getFirstDayOfTodayMonth();
         }
         if (!this.objectService.filterEndDate) {
            this.objectService.filterEndDate = this.commonService.getTodayDate();
         }
         await this.objectService.loadRequiredMaster();
         await this.loadObjects();
      } catch (e) {
         console.error(e);
      }
   }

   async ionViewDidEnter(): Promise<void> {
      // check incomplete trx here
      let data = await this.configService.retrieveFromLocalStorage(this.objectService.trxKey);
      if (data) {
         if (data?.header?.toLocationId === this.configService?.selected_location) {
            this.promptIncompleteTrxAlert();
         } else {

         }
      }
   }

   ionViewDidLeave(): void {
      this.objectService.stopListening();
   }

   async ngOnInit() {

   }

   ngOnDestroy(): void {
      this.objectService.stopListening();
   }

   async promptIncompleteTrxAlert() {
      const alert = await this.alertController.create({
         cssClass: "custom-alert",
         header: "You have uncompleted transaction.",
         subHeader: "Do you want to retrieve or discard",
         backdropDismiss: false,
         buttons: [
            {
               text: "Retrieve",
               cssClass: "success",
               handler: async () => {
                  let data = await this.configService.retrieveFromLocalStorage(this.objectService.trxKey);
                  await this.objectService.setHeader(data.header);
                  await this.objectService.setLines(data.details);
                  this.navController.navigateRoot("/transactions/consignment-sales/consignment-sales-item");
               }
            },
            {
               text: "Discard",
               role: "cancel",
               cssClass: "cancel",
               handler: async () => {
                  await this.configService.removeFromLocalStorage(this.objectService.trxKey);
               }
            }
         ]
      });
      await alert.present();
   }

   /* #region  crud */

   async loadObjects() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getObjectListByDate(format(this.objectService.filterStartDate, "yyyy-MM-dd"), format(this.objectService.filterEndDate, "yyyy-MM-dd")).subscribe(async response => {
            this.objects = response;
            this.resetFilteredObj();
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

   goToDetail(objectId: number) {
      let navigationExtras: NavigationExtras = {
         queryParams: {
            objectId: objectId
         }
      }
      this.navController.navigateForward("/transactions/consignment-sales/consignment-sales-detail", navigationExtras);
   }

   /* #endregion */

   async filter() {
      try {
         const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
               startDate: this.objectService.filterStartDate,
               endDate: this.objectService.filterEndDate,
               locationFilter: true,
               locationList: this.objectService.locationSearchDropdownList,
               selectedLocationId: this.objectService.filterLocationId
            },
            canDismiss: true
         })
         await modal.present();
         let { data } = await modal.onWillDismiss();
         if (data && data !== undefined) {
            this.objectService.filterStartDate = new Date(data.startDate);
            this.objectService.filterEndDate = new Date(data.endDate);
            this.objectService.filterLocationId = data.locationIds;
            this.loadObjects();
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #region add */

   async onKeyDown(event, searchText) {
      if (event.keyCode === 13) {
         await this.search(searchText, true);
      }
   }

   itemSearchText: string;
   filteredObj: ConsignmentSalesList[] = [];
   search(searchText, newSearch: boolean = false) {
      if (newSearch) {
         this.filteredObj = [];
      }
      this.itemSearchText = searchText;
      try {
         if (searchText.length === 0) {
            this.resetFilteredObj();
         }
         else if (searchText && searchText.trim().length > 2) {
            if (Capacitor.getPlatform() !== "web") {
               Keyboard.hide();
            }
            this.filteredObj = JSON.parse(JSON.stringify(this.objects.filter(r => 
               r.consignmentSalesNum?.toUpperCase().includes(searchText.toUpperCase())
               || r.customerCode?.toUpperCase().includes(searchText.toUpperCase())
               || r.customerName?.toUpperCase().includes(searchText.toUpperCase())
               || r.toLocationCode?.toUpperCase().includes(searchText.toUpperCase())
               || r.toLocationDesc?.toUpperCase().includes(searchText.toUpperCase())
               || r.qtyRequest.toString().includes(searchText.toUpperCase())
               || r.grandTotal.toString().includes(searchText.toUpperCase())
            )));
            this.currentPage = 1;
         } else {
            this.resetFilteredObj();
            this.toastService.presentToast("", "Search with 3 characters and above", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   resetFilteredObj() {
      this.filteredObj = JSON.parse(JSON.stringify(this.objects));
      if (this.objectService.filterLocationId && this.objectService.filterLocationId.length > 0) {
         this.filteredObj = this.filteredObj.filter(r => this.objectService.filterLocationId.includes(r.toLocationId));
      }
      this.filteredObj = this.filteredObj.sort((a, b) => new Date(b.trxDate).getTime() - new Date(a.trxDate).getTime());
   }

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   // Select action

   async selectAction() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Choose an action",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Add Consignment Sales",
                  icon: "document-outline",
                  handler: () => {
                     this.addObject();
                  }
               },
               {
                  text: "Cancel",
                  icon: "close",
                  role: "cancel"
               }
            ]
         });
         await actionSheet.present();
      } catch (e) {
         console.error(e);
      }
   }

   async addObject() {
      if (!this.configService.selected_location) {
         this.toastService.presentToast("Control Error", "Please select a location first at setting tab.", "top", "warning", 2000);
      } else {
         this.objectService.resetVariables();
         this.navController.navigateForward("/transactions/consignment-sales/consignment-sales-header");
      }
   }

   /* #endregion */

}
