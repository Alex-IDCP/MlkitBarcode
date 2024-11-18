import { Component, DoCheck, IterableDiffers, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ViewWillEnter, ViewDidEnter, ActionSheetController, AlertController, ModalController, NavController, ViewDidLeave } from '@ionic/angular';
import { format } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SalesSearchModal } from 'src/app/shared/models/sales-search-modal';
import { CommonService } from 'src/app/shared/services/common.service';
import { FilterPage } from '../filter/filter.page';
import { StockReplenishService } from '../../services/stock-replenish.service';
import { SalesOrderList } from '../../models/sales-order';

@Component({
   selector: 'app-stock-replenish',
   templateUrl: './stock-replenish.page.html',
   styleUrls: ['./stock-replenish.page.scss'],
})
export class StockReplenishPage implements OnInit, OnDestroy, ViewWillEnter, ViewDidEnter, DoCheck, ViewDidLeave {

   private objectDiffer: any;
   objects: SalesOrderList[] = [];

   startDate: Date;
   endDate: Date;
   customerIds: number[] = [];
   salesAgentIds: number[] = [];

   uniqueGrouping: Date[] = [];

   constructor(
      private authService: AuthService,
      private commonService: CommonService,
      private objectService: StockReplenishService,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private modalController: ModalController,
      private navController: NavController,
      private toastService: ToastService,
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
      this.objectService.resetVariables();
      this.objects = []; // clear list when enter
      if (!this.startDate) {
         this.startDate = this.commonService.getFirstDayOfTodayMonth();
      }
      if (!this.endDate) {
         this.endDate = this.commonService.getTodayDate();
      }
      await this.objectService.loadRequiredMaster();
   }

   async ionViewDidEnter(): Promise<void> {
      await this.loadObjects();
   }

   async ionViewDidLeave(): Promise<void> {
      await this.objectService.stopListening();
   }

   ngOnInit() {

   }

   ngOnDestroy(): void {
      this.objectService.stopListening();
   }

   /* #region  crud */

   async loadObjects() {
      try {
         let obj: SalesSearchModal = {
            dateStart: format(this.startDate, "yyyy-MM-dd"),
            dateEnd: format(this.endDate, "yyyy-MM-dd"),
            customerId: this.customerIds,
            salesAgentId: this.salesAgentIds
         }
         this.objectService.getObjectListByDate(obj).subscribe(async response => {
            this.objects = response;
            this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
         }, async error => {
            console.error(error);
         })
      } catch (error) {
         this.toastService.presentToast("", "Error loading object.", "top", "danger", 1000);
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

   /* #region  add quotation */

   async addObject() {
      try {
         if (this.objectService.hasSalesAgent()) {
            this.objectService.resetVariables();
            this.navController.navigateForward("/transactions/stock-replenish/stock-replenish-header");
         } else {
            this.toastService.presentToast("System Error", "Sales Agent not set.", "top", "danger", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   // Select action
   async selectAction() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Choose an action",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Add Stock Replenish",
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

   /* #region download pdf */

   async presentAlertViewPdf(doc) {
      try {
         const alert = await this.alertController.create({
            header: "Download PDF?",
            message: "",
            buttons: [
               {
                  text: "OK",
                  cssClass: "success",
                  role: "confirm",
                  handler: async () => {
                     await this.downloadPdf(doc);
                  },
               },
               {
                  cssClass: "cancel",
                  text: "Cancel",
                  role: "cancel"
               },
            ]
         });
         await alert.present();
      } catch (e) {
         console.error(e);
      }
   }

   async downloadPdf(doc) {
      try {
         this.objectService.downloadPdf("SMSC002", "pdf", doc.salesOrderId, "Proforma Invoice").subscribe(response => {
            let filename = doc.salesOrderNum + ".pdf";
            this.commonService.commonDownloadPdf(response, filename);
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   showDraftOnly: boolean = false;
   async filter() {
      try {
         const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
               startDate: this.startDate,
               endDate: this.endDate,
               customerFilter: false,
               // customerList: this.objectService.customerSearchDropdownList,
               selectedCustomerId: this.customerIds,
               salesAgentFilter: true,
               salesAgentList: this.objectService.salesAgentDropdownList,
               selectedSalesAgentId: this.salesAgentIds,
               useDraft: false,
               showDraftOnly: this.showDraftOnly
            },
            canDismiss: true
         })
         await modal.present();
         let { data } = await modal.onWillDismiss();
         if (data && data !== undefined) {
            this.objects = [];
            this.uniqueGrouping = [];
            this.startDate = new Date(data.startDate);
            this.endDate = new Date(data.endDate);
            this.customerIds = data.customerIds;
            this.salesAgentIds = data.salesAgentIds;
            this.showDraftOnly = data.showDraftOnly ?? false;
            this.loadObjects();
         }
      } catch (e) {
         console.error(e);
      }
   }

   goToDetail(objectId: number, isDraft: boolean, draftTransactionId: number) {
      try {
         let navigationExtras: NavigationExtras = {
            queryParams: {
               objectId: objectId,
               isDraft: isDraft,
               draftTransactionId: draftTransactionId
            }
         }
         this.navController.navigateForward("/transactions/stock-replenish/stock-replenish-detail", navigationExtras);
      } catch (e) {
         console.error(e);
      }
   }

}
