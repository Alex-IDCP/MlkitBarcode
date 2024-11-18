import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportParameterModel } from 'src/app/shared/models/report-param-model';
import { CommonService } from 'src/app/shared/services/common.service';
import { ReportSOListing } from '../../../models/rp-so-listing';
import { ReportsService } from '../../../services/reports.service';
import { AlertController, IonDatetime, ViewWillEnter } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { DebtorOutstandingRequest } from '../../../models/debtor-outstanding';
import { format, parseISO } from 'date-fns';
import { ToastService } from 'src/app/services/toast/toast.service';
import { DatePipe } from '@angular/common';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ModuleControl } from 'src/app/shared/models/module-control';

@Component({
   selector: 'app-rp-so-listing',
   templateUrl: './rp-so-listing.page.html',
   styleUrls: ['./rp-so-listing.page.scss'],
   providers: [DatePipe]
})
export class RpSoListingPage implements OnInit, ViewWillEnter {

   customers: Customer[] = [];
   customerSearchDropdownList: SearchDropdownList[] = [];
   objects: ReportSOListing[] = [];
   isOverdueOnly: boolean = false;
   dateRangeSearchDropdownList: SearchDropdownList[] = [];

   configSOListDisplayDOAcknowledgement: boolean = false;

   data: any;
   columns: any;

   constructor(
      private objectService: ReportsService,
      private authService: AuthService,
      private commonService: CommonService,
      private alertController: AlertController,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private datePipe: DatePipe
   ) { }

   ionViewWillEnter(): void {
      this.loadModuleControl();
   }

   ngOnInit() {
      this.loadCustomers();
      this.columns = [
         { prop: 'issuedDate', name: 'Issued Date', draggable: false },
         { prop: 'debtorCode', name: 'Debtor Code', draggable: false },
         { prop: 'debtorName', name: 'Debtor Name', draggable: false },
         { prop: 'salesmanName', name: 'Salesman', draggable: false },
         // { prop: 'onlineOrder', name: 'Online Order', draggable: false },
         { prop: 'orderStatus', name: 'Order Status', draggable: false },
         { prop: 'salesOrderNum', name: 'Sales Order', draggable: false },
         { prop: 'salesInvoiceIds', name: 'Sales Invoice', draggable: false },
         { prop: 'deliveryOrderIds', name: 'Delivery Order', draggable: false },
         { prop: 'delivered', name: 'Delivered', draggable: false },
         { prop: 'netAmount', name: 'Net Amount', draggable: false }
      ]
      this.dateRangeSearchDropdownList = [];
      this.dateRangeSearchDropdownList.push(
         { id: 0, code: "T", description: `Today (${format(this.commonService.getTodayDate(), 'dd/MM/yyyy')})` },
         { id: 1, code: "7", description: `Last 7 Days (${format(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 7), 'dd/MM/yyyy')})` },
         { id: 2, code: "30", description: `Last 30 Days (${format(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 30), 'dd/MM/yyyy')})` },
         { id: 3, code: "60", description: `Last 60 Days (${format(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 60), 'dd/MM/yyyy')})` },
         { id: 4, code: "90", description: `Last 90 Days (${format(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 90), 'dd/MM/yyyy')})` },
         { id: 5, code: "180", description: `Last 180 Days (${format(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 180), 'dd/MM/yyyy')})` },
         { id: 6, code: "C", description: 'Custom Range' }
      )
      this.onDateRangeChanged({ id: 2 });
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

   moduleControl: ModuleControl[];
   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;

            let soListDisplayDOAcknowledgement = this.moduleControl.find(x => x.ctrlName === "SOListDisplayDOAcknowledgement")?.ctrlValue;
            if (soListDisplayDOAcknowledgement && soListDisplayDOAcknowledgement.toUpperCase() === "Y") {
               this.configSOListDisplayDOAcknowledgement = true;
            } else {
               this.configSOListDisplayDOAcknowledgement = false;
            }
         })
      } catch (e) {
         console.error(e);
      }
   }

   async loadObjects() {
      try {
         await this.loadingService.showLoading();
         let obj: DebtorOutstandingRequest = { // sharing same report request parameter
            customerId: this.customerIds ?? [],
            trxDate: format(new Date(this.endDateValue), 'yyyy-MM-dd'),
            isOverdueOnly: this.isOverdueOnly,
            trxDateFrom: this.startDateValue ? format(new Date(this.startDateValue), 'yyyy-MM-dd') : null
         }
         this.objects = await this.objectService.getSOListing(obj);
         await this.loadingService.dismissLoading();
      } catch (error) {
         console.error(error);
         await this.loadingService.dismissLoading();
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   customerIds: number[];
   onCustomerSelected(event: any[]) {
      if (event && event !== undefined) {
         this.customerIds = event.flatMap(r => r.id);
      }
   }

   selectedDateRangeId = 2;
   onDateRangeChanged(event) {
      if (event) {
         this.selectedDateRangeId = event.id;
         switch (this.selectedDateRangeId) {
            case 0:
               this.startDateValue = format(this.commonService.getTodayDate(), "yyyy-MM-dd") + "T08:00:00.000Z";
               break;
            case 1:
               this.startDateValue = format(new Date(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 7)), "yyyy-MM-dd") + "T08:00:00.000Z";
               //new Date(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 7));
               break;
            case 2:
               this.startDateValue = format(new Date(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 30)), "yyyy-MM-dd") + "T08:00:00.000Z";
               // new Date(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 30));
               break;
            case 3:
               this.startDateValue = format(new Date(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 60)), "yyyy-MM-dd") + "T08:00:00.000Z";
               //new Date(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 60));
               break;
            case 4:
               this.startDateValue = format(new Date(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 90)), "yyyy-MM-dd") + "T08:00:00.000Z";
               //new Date(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 90));
               break;
            case 5:
               this.startDateValue = format(new Date(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 180)), "yyyy-MM-dd") + "T08:00:00.000Z";
               //new Date(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 180));
               break;
            case 6:
               this.startDateValue = format(new Date(this.commonService.getTodayDate().setDate(this.commonService.getTodayDate().getDate() - 30)), "yyyy-MM-dd") + "T08:00:00.000Z";
               this.endDateValue = format(this.commonService.getTodayDate(), "yyyy-MM-dd") + "T08:00:00.000Z";
               break;
         }
      }
      this.setFormattedDateString();
   }

   error: any;
   async downloadPdf(objectId: number, objectName: string) {
      try {
         let paramModel: ReportParameterModel = {
            appCode: 'SMSC002',
            format: 'pdf',
            documentIds: [Number(objectId)],
            reportName: 'Sales Order'
         }
         this.objectService.getPdf(paramModel).subscribe(async response => {
            await this.commonService.commonDownloadPdf(response, objectName + "." + paramModel.format).then((ret) => {
               this.error = ret;
            }).catch(error => {
               error = error;
            });
         }, error => {
            error = error;
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   printChildDialog: boolean = false;
   printObj: string[] = [];
   childType: string = "";
   async showDialogOrDownload(objs: string, type: string) {
      this.printObj = [];
      this.childType = type;
      try {
         if (objs && objs.length > 0) {
            this.printObj = objs.split(";");
            if (this.printObj && this.printObj.length === 1) {
               await this.presentAlertViewPdf(Number(this.printObj[0].split('|')[1]), this.printObj[0].split('|')[0], type);
            } else {
               this.showPrintChildDialog();
            }
         } 
      } catch (e) {
         console.error(e);
      }
   }

   showPrintChildDialog() {
      this.printChildDialog = true;
   }

   hidePrintChildDialog() {
      this.printChildDialog = false;
   }

   checkDoLength(obj: string) {
      if (obj && obj.length > 0) {
         return obj.split(";").length === 1;
      }
      return false;
   }

   getDOAckStatus(obj: string) {
      if (obj && obj.length > 0) {
         let dos = obj?.split(";");
         if (dos && dos.length === 1) {
            let r = dos[0].split("|");
            return r[2] === "1";
         }
      }
      return false;
   }

   async presentAlertViewPdf(objectId: any, objectName: string, type: string) {
      try {
         if (type && type.length > 0) {
            const alert = await this.alertController.create({
               header: 'Download PDF?',
               message: '',
               buttons: [
                  {
                     text: 'OK',
                     cssClass: 'success',
                     role: 'confirm',
                     handler: async () => {
                        if (type === 'SO') {
                           await this.downloadPdf(Number(objectId), objectName);
                        } else if (type === 'SI') {
                           await this.downloadSIPdf(Number(objectId), objectName);
                        } else {
                           await this.downloadDOPdf(Number(objectId), objectName);
                        }
                     },
                  },
                  {
                     cssClass: 'cancel',
                     text: 'Cancel',
                     role: 'cancel'
                  },
               ]
            });
            await alert.present();
         } else {
            this.toastService.presentToast("Doc Type Missing", "Please contact adminstrator.", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   downloadSIPdf(objectId: number, objectName: string) {
      let paramModel: ReportParameterModel = {
         appCode: 'SMSC003',
         format: 'pdf',
         documentIds: [Number(objectId)],
         reportName: 'Sales Invoice'
      }
      this.objectService.getPdf(paramModel).subscribe(async response => {
         await this.commonService.commonDownloadPdf(response, objectName + "." + paramModel.format);
      }, error => {
         console.error(error);
      })
   }

   downloadDOPdf(objectId: number, objectName: string) {
      let paramModel: ReportParameterModel = {
         appCode: 'WDOP001',
         format: 'pdf',
         documentIds: [Number(objectId)],
         reportName: 'Delivery Order'
      }
      this.objectService.getPdf(paramModel).subscribe(async response => {
         await this.commonService.commonDownloadPdf(response, objectName + "." + paramModel.format);
      }, error => {
         console.error(error);
      })
   }

   /* #region calendar handle here */

   formattedStartDateString: string = "";
   startDateValue = format(this.commonService.getFirstDayOfTodayMonth(), "yyyy-MM-dd") + "T08:00:00.000Z";
   maxDate = format(new Date("2099-12-31"), "yyyy-MM-dd") + "T08:00:00.000Z";
   @ViewChild("datetime") datetime: IonDatetime
   setFormattedDateString() {
      this.formattedStartDateString = format(parseISO(format(new Date(this.startDateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
      this.formattedEndDateString = format(parseISO(format(new Date(this.endDateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
   }

   onStartDateSelected(value: any) {
      this.startDateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
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
      this.endDateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
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
