import { Component, OnInit, ViewChild } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ReportParameterModel } from 'src/app/shared/models/report-param-model';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { DebtorOutstanding, DebtorOutstandingRequest } from '../../../models/debtor-outstanding';
import { ReportsService } from '../../../services/reports.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { AlertController, IonDatetime, IonPopover, ViewWillEnter } from '@ionic/angular';
import { CreditInfoDetails } from 'src/app/shared/models/credit-info';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SelectionType } from '@swimlane/ngx-datatable';

@Component({
   selector: 'app-debtor-latest-outstanding',
   templateUrl: './debtor-latest-outstanding.page.html',
   styleUrls: ['./debtor-latest-outstanding.page.scss']
})
export class DebtorLatestOutstandingPage implements OnInit, ViewWillEnter {

   customers: Customer[] = [];
   customerSearchDropdownList: SearchDropdownList[] = [];
   objects: DebtorOutstanding[] = [];
   isOverdueOnly: boolean = false;

   data: any;
   columns: any;

   constructor(
      private authService: AuthService,
      private objectService: ReportsService,
      private toastService: ToastService,
      private commonService: CommonService,
      private alertController: AlertController,
   ) {
      this.setFormattedDateString();
   }

   ionViewWillEnter(): void {

   }

   ngOnInit() {
      this.loadCustomers();
      this.columns = [
         { prop: 'customerName', name: 'Customer', draggable: false },
         { prop: 'salesAgentName', name: 'SA', draggable: false },
         { prop: 'currencyCode', name: 'Currency', draggable: false },
         { prop: 'balance', name: 'Outstanding', draggable: false }
      ]
      this.creditCols = [
         { prop: 'trxDate', name: 'Trx Date', draggable: false },
         { prop: 'overdueDay', name: 'O/D Day', draggable: false },
         { prop: 'docNum', name: 'Doc. Number', draggable: false },
         { prop: 'amount', name: 'Amount', draggable: false }
      ]
   }

   loadCustomers() {
      this.objectService.getCustomers().subscribe(async response => {
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
      }, error => {
         console.log(error);
      })
   }

   loadDebtorReport() {
      this.selected = [];
      let obj: DebtorOutstandingRequest = {
         customerId: this.customerIds ?? [],
         trxDate: format(new Date(this.dateValue), "yyyy-MM-dd"),
         isOverdueOnly: this.isOverdueOnly
      }
      this.objectService.getDebtorOutstanding(obj).subscribe(response => {
         this.objects = response;
         this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 300, true);
      }, error => {
         console.log(error);
      })
   }

   customerIds: number[];
   onCustomerSelected(event: any[]) {
      if (event && event !== undefined) {
         this.customerIds = event.flatMap(r => r.id);
      }
   }

   /* #region calendar handle here */

   formattedDateString: string = "";
   dateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   maxDate = format(new Date("2099-12-31"), "yyyy-MM-dd") + "T08:00:00.000Z";
   @ViewChild("datetime") datetime: IonDatetime
   setFormattedDateString() {
      this.formattedDateString = format(parseISO(format(new Date(this.dateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
   }

   onTrxDateSelected(value: any) {
      this.dateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
      this.setFormattedDateString();
   }

   dateDismiss() {
      this.datetime.cancel(true);
   }

   dateSelect() {
      this.datetime.confirm(true);
   }

   /* #endregion */

   async presentAlertViewPdf(object: DebtorOutstanding) {
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

   async downloadPdf(object: DebtorOutstanding[]) {
      if (object && object.length > 0) {
         let paramModel: ReportParameterModel = {
            appCode: "FAMS002",
            format: "pdf",
            documentIds: object.flatMap(r => r.customerId),
            reportName: "Debtor Statement",
            customReportParam: {
               parameter1: object.flatMap(r => r.customerId),
               statementDate: new Date(this.dateValue)
            }
         }
         let timestart = new Date();
         await this.objectService.getPdf(paramModel).subscribe(async response => {
            let timeend = new Date();
            if (object && object.length === 1) {
               await this.commonService.commonDownloadPdf(response, object[0].customerName + "." + paramModel.format);
            } else {
               await this.commonService.commonDownloadPdf(response, "Debtor_Statements." + paramModel.format);
            }
            this.toastService.presentToast(`download pdf`, (timeend.getTime() - timestart.getTime()).toString(), "top", "success", 1000);
         }, error => {
            console.log(error);
         })
      } else {
         this.toastService.presentToast("Invalid Key Id", "Please contact adminstrator.", "top", "danger", 1000);
      }
   }


   loadCreditInfo(customerId: number) {
      this.objectService.getCreditInfo(customerId).subscribe(response => {
         this.displayDetails(response.outstanding, "Outstanding Amount");
      }, error => {
         console.error(error);
      })
   }

   displayModal: boolean = false;
   creditInfoType: string = "";
   tableValue: CreditInfoDetails[] = [];
   creditCols: any[] = [];
   displayDetails(tableValue: CreditInfoDetails[], infoType: string) {
      try {
         this.displayModal = true;
         this.creditInfoType = infoType;
         this.tableValue = [];
         this.tableValue = [...tableValue];
      } catch (e) {
         console.error(e);
      }
   }

   hideItemModal() {
      this.displayModal = false;
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

}
