import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportsService } from '../../../services/reports.service';
import { AlertController, IonDatetime, ViewWillEnter } from '@ionic/angular';
import { Customer } from '../../../../transactions/models/customer';
import { SearchDropdownList } from '../../../../../shared/models/search-dropdown-list';
import { format, parseISO } from 'date-fns';
import { CommonService } from '../../../../../shared/services/common.service';
import { LoadingService } from '../../../../../services/loading/loading.service';
import { ItemSalesAnalysis } from '../../../models/item-sales-analysis';
import { ToastService } from '../../../../../services/toast/toast.service';
import { Item } from '../../../../transactions/models/item';
import { ReportParameterModel } from '../../../../../shared/models/report-param-model';

@Component({
   selector: 'app-item-sales-analysis',
   templateUrl: './item-sales-analysis.page.html',
   styleUrls: ['./item-sales-analysis.page.scss'],
})
export class ItemSalesAnalysisPage implements OnInit, ViewWillEnter {

   customers: Customer[] = [];
   customerSearchDropdownList: SearchDropdownList[] = [];
   selectedCustomerIds: number[] = [];

   items: Item[] = [];
   itemSearchDropdownList: SearchDropdownList[] = [];
   selectedItemIds: number[] = [];

   fullObject: ItemSalesAnalysis[] = [];

   groupByType: string = "customer";

   constructor(
      private objectService: ReportsService,
      private commonService: CommonService,
      private loadingService: LoadingService,
      private toastService: ToastService,
      private alertController: AlertController
   ) {
      this.setFormattedDateString();
   }

   async ionViewWillEnter(): Promise<void> {
      await this.loadCustomer();
      await this.loadItem();
   }

   ngOnInit() {
   }

   loadCustomer() {
      this.customers = [];
      this.customerSearchDropdownList = [];
      this.selectedCustomerIds = [];
      this.objectService.getCustomers().subscribe({
         next: async (response) => {
            this.customers = response;
            await this.customers.sort((a, c) => { return a.name > c.name ? 1 : -1 });
            this.customers.forEach(r => {
               this.customerSearchDropdownList.push({
                  id: r.customerId,
                  code: r.customerCode,
                  oldCode: r.oldCustomerCode,
                  description: r.name
               })
            })
         },
         error: (error) => {
            console.error(error);
         }
      })
   }

   loadItem() {
      this.items = [];
      this.itemSearchDropdownList = [];
      this.selectedItemIds = [];
      this.objectService.getItems().subscribe({
         next: async (response) => {
            this.items = response;
            this.items.forEach(r => {
               this.itemSearchDropdownList.push({
                  id: r.itemId,
                  code: r.itemCode,
                  description: r.description
               })
            })
         },
         error: (error) => {
            console.error(error);
         }
      })
   }

   onCustomerSelected(event: SearchDropdownList[]) {
      if (event && event.length > 0) {
         this.selectedCustomerIds = event.flatMap(r => r.id);
      } else {
         this.selectedCustomerIds = [];
      }
   }

   onItemSelected(event: SearchDropdownList[]) {
      if (event && event.length > 0) {
         this.selectedItemIds = event.flatMap(r => r.id);
      } else {
         this.selectedItemIds = [];
      }
   }

   objects: any[] = [];
   async loadReport() {
      try {
         this.fullObject = [];
         await this.loadingService.showLoading();
         this.objects = [];
         this.objectService.getItemSalesAnalysis({
            dateStart: new Date(format(new Date(this.startDateValue), "yyyy-MM-dd") + "T00:00:00.000Z"),
            dateEnd: new Date(format(new Date(this.endDateValue), "yyyy-MM-dd") + "T00:00:00.000Z"),
            itemId: this.selectedItemIds,
            customerId: this.selectedCustomerIds,
            groupByType: this.groupByType
         }).subscribe(async response => {
            this.fullObject = response;
            this.groupExpansionDefaultStatus = true;
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("Search Complete", `${this.fullObject.length} record(s) found.`, "top", "success", 300, true);
            this.objects = this.fullObject;
         }, async error => {
            await this.loadingService.dismissLoading();
            console.error(error);
         })
      } catch (error) {
         await this.loadingService.dismissLoading();
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   /* #region calendar handle here */

   formattedStartDateString: string = "";
   startDateValue = format(this.commonService.getFirstDayOfTodayMonth(), "yyyy-MM-dd") + "T08:00:00.000Z";   
   maxDate = format(new Date("2099-12-31"), "yyyy-MM-dd") + "T08:00:00.000Z";
   @ViewChild("startdatetime") startdatetime: IonDatetime
   @ViewChild("enddatetime") enddatetime: IonDatetime
   setFormattedDateString() {
      this.formattedStartDateString = format(parseISO(format(new Date(this.startDateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
      this.formattedEndDateString = format(parseISO(format(new Date(this.endDateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
   }

   onStartDateSelected(value: any) {
      this.startDateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
      this.setFormattedDateString();
   }

   startDateDismiss() {
      this.startdatetime.cancel(true);
   }

   startDateSelect() {
      this.startdatetime.confirm(true);
   }

   formattedEndDateString: string = "";
   endDateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   onEndDateSelected(value: any) {
      this.endDateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
      this.setFormattedDateString();
   }

   endDateDismiss() {
      this.enddatetime.cancel(true);
   }

   endDateSelect() {
      this.enddatetime.confirm(true);
   }

   /* #endregion */

   @ViewChild("myTable") table: any;
   groupExpansionDefaultStatus: boolean = true;
   toggleExpandGroup(group) {
      this.groupExpansionDefaultStatus = false;
      this.table.groupHeader.toggleExpandGroup(group);
   }

   onDetailToggle(event) {

   }

   /* #region download */

   async presentAlertViewPdf(object: ItemSalesAnalysis) {
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
                     await this.downloadPdf(object);
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

   async downloadPdf(object: ItemSalesAnalysis) {
      try {
         let appCode = "";
         let reportName = "";
         switch (object.docType) {
            case "SI":
               appCode = "SMSC003";
               reportName = "Sales Invoice";
               break;
            case "CI":
               appCode = "SMCS002";
               reportName = "Consignment Invoice";
               break;
         }
         if (appCode !== null && appCode.length > 0) {
            let paramModel: ReportParameterModel = {
               appCode: appCode,
               format: "pdf",
               documentIds: [object.docId],
               reportName: reportName
            }
            let timestart = new Date();
            await this.objectService.getPdf(paramModel).subscribe(async response => {
               let timeend = new Date();
               await this.loadingService.dismissLoading();
               await this.commonService.commonDownloadPdf(response, object.docNum + "." + paramModel.format);
               this.toastService.presentToast(`download pdf`, (timeend.getTime() - timestart.getTime()).toString(), "top", "success", 1000);
            }, async error => {
               await this.loadingService.dismissLoading();
               console.log(error);
            })
         } else {
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("Invalid Key Id", "Please contact adminstrator.", "top", "danger", 1000);
         }
      } catch (error) {
         await this.loadingService.dismissLoading();
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   /* #endregion */

}
