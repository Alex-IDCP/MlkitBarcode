import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonDatetime, IonPopover, ViewWillEnter } from '@ionic/angular';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';
import { ReportsService } from '../../services/reports.service';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { TransactionInquiryObject } from '../../models/transaction-inquiry';
import { SelectionType } from '@swimlane/ngx-datatable';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ReportParameterModel } from 'src/app/shared/models/report-param-model';
import { format, parseISO } from 'date-fns';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
   selector: 'app-transaction-inquiry',
   templateUrl: './transaction-inquiry.page.html',
   styleUrls: ['./transaction-inquiry.page.scss'],
})
export class TransactionInquiryPage implements OnInit, ViewWillEnter {

   type: SearchDropdownList[] = [];
   selectedType: SearchDropdownList = null;
   customer: Customer[] = [];
   customerSearchDropdown: SearchDropdownList[] = [];
   selectedCustomer: SearchDropdownList = null;
   docNum: string;

   object: TransactionInquiryObject[] = [];

   constructor(
      private objectService: ReportsService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private alertController: AlertController
   ) {
      this.setFormattedDateString();
   }

   ionViewWillEnter(): void {

   }

   ngOnInit() {
      this.loadCustomer();
      this.type.push(
         { id: 0, code: "SO", description: "Sales Order" },
         { id: 1, code: "SI", description: "Sales Invoice" },
         { id: 2, code: "CN/SR", description: "Sales/AR Credit Note & Sales Return" },
         { id: 3, code: "DN", description: "Sales/AR Debit Note" }
      );
   }

   loadCustomer() {
      this.customerSearchDropdown = [];
      this.objectService.getCustomers().subscribe(response => {
         this.customer = response;
         this.customer.forEach(r => {
            this.customerSearchDropdown.push({
               id: r.customerId,
               code: r.customerCode,
               description: r.name
            })
         })
      }, error => {
         console.error(error);
      })
   }

   objects: any[] = [];
   async loadReport() {
      try {
         await this.loadingService.showLoading("Loading", false);
         this.object = [];
         this.objectService.getTransactionInquiry({
            type: this.selectedType?.code,
            dateStart: new Date(format(new Date(this.startDateValue), "yyyy-MM-dd") + "T00:00:00.000Z"),
            dateEnd: new Date(format(new Date(this.endDateValue), "yyyy-MM-dd") + "T00:00:00.000Z"),
            customerId: (this.selectedCustomer ? [this.selectedCustomer?.id] : null),
            wildDocNum: this.docNum
         }).subscribe(async response => {
            this.object = response;
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("Search Complete", `${response.length} record(s) found.`, "top", "success", 300, true);
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

   onTypeChanged(event: any) {
      this.selectedType = event;
   }

   onCustomerChanged(event: any) {
      this.selectedCustomer = event;
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

   /* #region select all */

   SelectionType = SelectionType;
   selected = [];
   onSelect(event) {
      this.selected.splice(0, this.selected.length);
      this.selected.push(...event.selected);
   }

   onActivate(event) {

   }

   async printAllAlert() {
      try {
         if (this.selected && this.selected.length > 0) {
            const alert = await this.alertController.create({
               header: `Download ${this.selected.length} PDF?`,
               message: "",
               buttons: [
                  {
                     text: "OK",
                     cssClass: "success",
                     role: "confirm",
                     handler: async () => {
                        await this.downloadPdf(this.selected);
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
         } else {
            this.toastService.presentToast("", "Please choose at least 1 document to print", "top", "danger", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region download */

   async presentAlertViewPdf(object: TransactionInquiryObject) {
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
                     await this.downloadPdf([object]);
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

   async downloadPdf(object: TransactionInquiryObject[]) {
      try {
         if (object && object.length > 0) {
            let appCode = "";
            let reportName = "";
            switch (object[0].type) {
               case "SalesOrder":
                  appCode = "SMSC002";
                  reportName = "Sales Order";
                  break;
               case "SalesInvoice":
                  appCode = "SMSC003";
                  reportName = "Sales Invoice";
                  break;
               case "SalesReturn":
                  appCode = "SMSC004";
                  reportName = "Sales Return";
                  break;
               case "CreditNote":
                  appCode = "FAAR004";
                  reportName = "AR Credit Note";
                  break;
               case "SalesCreditNote":
                  appCode = "SMSC013";
                  reportName = "Sales Credit Note";
                  break;
               case "DebitNote":
                  appCode = "FAAR003";
                  reportName = "AR Debit Note";
                  break;
               case "SalesDebitNote":
                  appCode = "SMSC010";
                  reportName = "Sales Debit Note";
                  break;
            }
            if (appCode !== null && appCode.length > 0) {
               let paramModel: ReportParameterModel = {
                  appCode: appCode,
                  format: "pdf",
                  documentIds: object.flatMap(r => r.docId),
                  reportName: reportName
               }
               let timestart = new Date();
               await this.objectService.getPdf(paramModel).subscribe(async response => {
                  let timeend = new Date();
                  await this.loadingService.dismissLoading();
                  await this.commonService.commonDownloadPdf(response, (object.length > 1 ? object[0].type.replace(" ", "") : object[0].docNum) + "." + paramModel.format);
                  this.toastService.presentToast(`download pdf`, (timeend.getTime() - timestart.getTime()).toString(), "top", "success", 1000);
               }, async error => {
                  await this.loadingService.dismissLoading();
                  console.log(error);
               })
            } else {
               await this.loadingService.dismissLoading();
               this.toastService.presentToast("Invalid Key Id", "Please contact adminstrator.", "top", "danger", 1000);
            }
         } else {
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("Invalid App Code", "Please contact adminstrator.", "top", "danger", 1000);
         }
      } catch (error) {
         await this.loadingService.dismissLoading();
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   /* #endregion */

   /* #region calendar handle here */

   formattedStartDateString: string = "";
   startDateValue = format(this.commonService.getFirstDayOfTodayMonth(), "yyyy-MM-dd") + "T08:00:00.000Z";
   maxDate = format(new Date("2099-12-31"), "yyyy-MM-dd") + "T08:00:00.000Z";
   @ViewChild("datetime") datetime: IonDatetime
   setFormattedDateString() {
      this.formattedStartDateString = format(parseISO(format(new Date(this.startDateValue), "yyyy-MM-dd") + `T00:00:00.000Z`), "MMM d, yyyy");
      this.formattedEndDateString = format(parseISO(format(new Date(this.endDateValue), "yyyy-MM-dd") + `T00:00:00.000Z`), "MMM d, yyyy");
   }

   onStartDateSelected(value: any) {
      this.startDateValue = format(new Date(value), "yyyy-MM-dd") + "T08:00:00.000Z";
      this.setFormattedDateString();
   }

   startDateDismiss() {
      this.datetime.cancel(true);
   }

   startDateSelect() {
      this.datetime.confirm(true);
   }

   formattedEndDateString: string = "";
   endDateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   onEndDateSelected(value: any) {
      this.endDateValue = format(new Date(value), "yyyy-MM-dd") + "T08:00:00.000Z";
      this.setFormattedDateString();
   }

   endDateDismiss() {
      this.datetime.cancel(true);
   }

   endDateSelect() {
      this.datetime.confirm(true);
   }

   /* #endregion */

}
