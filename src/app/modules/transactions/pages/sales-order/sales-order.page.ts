import { Component, DoCheck, IterableDiffers, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, ModalController, NavController, ViewDidEnter, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SalesOrderList, SalesOrderRoot } from '../../models/sales-order';
import { CommonService } from '../../../../shared/services/common.service';
import { SalesOrderService } from '../../services/sales-order.service';
import { FilterPage } from '../filter/filter.page';
import { format } from 'date-fns';
import { SalesSearchModal } from 'src/app/shared/models/sales-search-modal';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DraftTransaction } from 'src/app/shared/models/draft-transaction';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

@Component({
   selector: 'app-sales-order',
   templateUrl: './sales-order.page.html',
   styleUrls: ['./sales-order.page.scss']
})
export class SalesOrderPage implements OnInit, OnDestroy, ViewWillEnter, ViewDidEnter, DoCheck, ViewDidLeave {

   private objectDiffer: any;
   objects: SalesOrderList[] = [];
   draftObjectList: SalesOrderList[] = [];
   draftObjects: DraftTransaction[] = [];

   uniqueGrouping: Date[] = [];

   currentPage: number = 1;
   itemsPerPage: number = 20;

   constructor(
      private authService: AuthService,
      private commonService: CommonService,
      private objectService: SalesOrderService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private modalController: ModalController,
      private navController: NavController,
      private differs: IterableDiffers
   ) {
      this.objectDiffer = this.differs.find(this.objects).create();
   }

   ngDoCheck(): void {
      const objectChanges = this.objectDiffer.diff(this.objects);
      if (objectChanges) {
         // this.bindUniqueGrouping();
      }
   }

   async ionViewWillEnter(): Promise<void> {
      if (this.objectService.filterStartDate === null || this.objectService.filterStartDate === undefined) {
         this.objectService.filterStartDate = this.commonService.getFirstDayOfTodayMonth();
      }
      if (this.objectService.filterEndDate === null || this.objectService.filterEndDate === undefined) {
         this.objectService.filterEndDate = this.commonService.getTodayDate();
      }
      this.itemSearchText = null;
   }

   async ionViewDidEnter(): Promise<void> {
      await this.objectService.loadRequiredMaster();
      if (this.objectService.filterShowDraftOnly) {
         await this.loadDraftObjects();
      } else {
         await this.loadObjects();
         await this.loadDraftObjects();
      }
   }

   async ionViewDidLeave(): Promise<void> {
      await this.objectService.stopListening();
   }

   ngOnInit() {

   }

   ngOnDestroy(): void {
   }

   /* #region  crud */

   async loadObjects() {
      try {
         this.objects = [];
         await this.loadingService.showLoading();
         let obj: SalesSearchModal = {
            dateStart: format(this.objectService.filterStartDate, "yyyy-MM-dd"),
            dateEnd: format(this.objectService.filterEndDate, "yyyy-MM-dd"),
            customerId: this.objectService.filterCustomerIds,
            salesAgentId: this.objectService.filterSalesAgentIds
         }
         this.objectService.getObjectListByDate(obj).subscribe(async response => {
            this.objects = [...this.objects, ...response];
            this.resetFilteredObj();
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
         }, async error => {
            await this.loadingService.dismissLoading();
            console.log(error);
         })
      } catch (error) {
         await this.loadingService.dismissLoading();
         this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
         console.log(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   async loadDraftObjects() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getDraftObjects().subscribe(async response => {
            this.draftObjects = response;
            for await (let rowData of this.draftObjects) {
               let objRoot: SalesOrderRoot = JSON.parse(rowData.jsonData);
               objRoot.header = this.commonService.convertObjectAllDateType(objRoot.header);
               let obj: SalesOrderList = {
                  salesOrderId: objRoot.header.salesOrderId,
                  salesOrderNum: rowData.draftTransactionNum,
                  trxDate: objRoot.header.trxDate,
                  customerCode: await this.objectService.customerMasterList.find(r => r.id === objRoot.header.customerId)?.code,
                  customerName: await this.objectService.customerMasterList.find(r => r.id === objRoot.header.customerId)?.description,
                  salesAgentName: await this.objectService.salesAgentMasterList.find(r => r.id === objRoot.header.salesAgentId)?.description,
                  countryDescription: null,
                  currencyCode: await this.objectService.currencyMasterList.find(r => r.id === objRoot.header.currencyId)?.code,
                  grandTotal: objRoot.details.flatMap(r => r.subTotal).reduce((a, c) => a + c, 0),
                  qty: objRoot.details.flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0),
                  otherAmountCount: objRoot.otherAmount?.length,
                  deactivated: objRoot.header.deactivated,
                  createdById: objRoot.header.createdById,
                  isDraft: true,
                  isClosed: objRoot.header.isClosed,
                  draftTransactionId: rowData.draftTransactionId
               }
               this.objects.unshift(obj);
               this.resetFilteredObj();
            }
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
         }, async error => {
            await this.loadingService.dismissLoading();
            console.log(error);
         })
      } catch (error) {
         await this.loadingService.dismissLoading();
         this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   // getObjects(date: Date) {
   //    return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate());
   // }

   /* #endregion */

   /* #region  add quotation */

   async addObject() {
      try {
         // if (this.objectService.hasSalesAgent()) {
         this.objectService.resetVariables();
         this.navController.navigateForward("/transactions/sales-order/sales-order-header");
         // } else {
         //   this.toastService.presentToast("Control Error", "Sales Agent not set", "top", "warning", 1000);
         // }
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
                  text: "Add Sales Order",
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

   async filter() {
      try {
         const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
               startDate: this.objectService.filterStartDate,
               endDate: this.objectService.filterEndDate,
               customerFilter: true,
               customerList: this.objectService.customerSearchDropdownList,
               selectedCustomerId: this.objectService.filterCustomerIds,
               salesAgentFilter: true,
               salesAgentList: this.objectService.salesAgentDropdownList,
               selectedSalesAgentId: this.objectService.filterSalesAgentIds,
               useDraft: true,
               showDraftOnly: this.objectService.filterShowDraftOnly,
               useShowClosed: true,
               showClosed: this.objectService.filterShowClosed
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
            this.objectService.filterCustomerIds = data.customerIds;
            this.objectService.filterSalesAgentIds = data.salesAgentIds;
            this.objectService.filterShowDraftOnly = data.showDraftOnly ?? false;
            this.objectService.filterShowClosed = data.showClosed ?? false;
            if (data.showDraftOnly) {
               this.loadDraftObjects();
            } else {
               await this.loadObjects();
               await this.loadDraftObjects();
            }
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
         this.navController.navigateForward("/transactions/sales-order/sales-order-detail", navigationExtras);
      } catch (e) {
         console.error(e);
      }
   }

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   async onKeyDown(event, searchText) {
      if (event.keyCode === 13) {
         await this.search(searchText, true);
      }
   }

   itemSearchText: string;
   filteredObj: SalesOrderList[] = [];
   search(searchText, newSearch: boolean = false) {
      if (newSearch) {
         this.filteredObj = [];
      }
      this.itemSearchText = searchText;
      try {
         if (searchText && searchText.trim().length > 2) {
            if (Capacitor.getPlatform() !== "web") {
               Keyboard.hide();
            }
            this.filteredObj = JSON.parse(JSON.stringify(this.objects.filter(r =>
               r.salesOrderNum?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.customerCode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.customerName?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.salesAgentName?.toUpperCase().includes(searchText.toUpperCase())
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
      if (!this.objectService.filterShowClosed) {
         this.filteredObj = this.filteredObj.filter(r => !r.isClosed);
      }
      this.filteredObj = this.filteredObj.sort((a, b) => new Date(b.trxDate).getTime() - new Date(a.trxDate).getTime());
   }

}
