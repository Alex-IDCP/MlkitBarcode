import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, ModalController, NavController, ViewDidEnter, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { QuotationList } from '../../models/quotation';
import { CommonService } from '../../../../shared/services/common.service';
import { QuotationService } from '../../services/quotation.service';
import { FilterPage } from '../filter/filter.page';
import { format } from 'date-fns';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { Customer } from '../../models/customer';
import { SalesSearchModal } from 'src/app/shared/models/sales-search-modal';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
   selector: 'app-quotation',
   templateUrl: './quotation.page.html',
   styleUrls: ['./quotation.page.scss']
})
export class QuotationPage implements OnInit, OnDestroy, ViewWillEnter, ViewDidEnter, ViewDidLeave {

   objects: QuotationList[] = [];

   startDate: Date;
   endDate: Date;
   customerIds: number[] = [];

   uniqueGrouping: Date[] = [];

   constructor(
      private objectService: QuotationService,
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
      if (!this.startDate) {
         this.startDate = this.commonService.getFirstDayOfTodayMonth();
      }
      if (!this.endDate) {
         this.endDate = this.commonService.getTodayDate();
      }
      await this.objectService.loadRequiredMaster();
      await this.loadObjects();
      await this.bindCustomerList();
   }

   ionViewDidEnter(): void {

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
         await this.loadingService.showLoading();
         let obj: SalesSearchModal = {
            dateStart: format(this.startDate, "yyyy-MM-dd"),
            dateEnd: format(this.endDate, "yyyy-MM-dd"),
            customerId: this.customerIds
         }
         this.objectService.getObjectListByDate(obj).subscribe(async response => {
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

   selectedCustomer: Customer;
   customerSearchDropdownList: SearchDropdownList[] = [];
   bindCustomerList() {
      this.objectService.customers.forEach(r => {
         this.customerSearchDropdownList.push({
            id: r.customerId,
            code: r.customerCode,
            oldCode: r.oldCustomerCode,
            description: r.name
         })
      })
   }

   /* #endregion */

   /* #region  add quotation */

   async addObject() {
      try {
         // if (this.objectService.hasSalesAgent()) {
            this.objectService.resetVariables();
            this.navController.navigateForward("/transactions/quotation/quotation-header");
         // } else {
         //    this.toastService.presentToast("Control Error", "Sales Agent not set", "top", "danger", 1000);
         // }
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
                  text: "Add Quotation",
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
         this.objectService.downloadPdf("SMSC001", "pdf", doc.quotationId).subscribe(response => {
            let filename = doc.quotationNum + ".pdf";
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
               startDate: this.startDate,
               endDate: this.endDate,
               customerFilter: true,
               customerList: this.customerSearchDropdownList,
               selectedCustomerId: this.customerIds
            },
            canDismiss: true
         })
         await modal.present();
         let { data } = await modal.onWillDismiss();
         if (data && data !== undefined) {
            this.startDate = new Date(data.startDate);
            this.endDate = new Date(data.endDate);
            this.customerIds = data.customerIds;
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
         this.navController.navigateForward("/transactions/quotation/quotation-detail", navigationExtras);
      } catch (e) {
         console.error(e);
      }
   }

}
